/*
 * Hylight — サビから始まる曲を次々流す音楽ディスカバリー
 * -----------------------------------------------------------------------------
 * - 2つの YouTube プレイヤーを重ね、片方を再生中にもう片方を裏でプリロード。
 *   時間が来たらクロスフェードで滑らかに切替。
 * - すべて曲の「サビ（chorusStart）」から再生。
 * - 推薦は特徴ベクトル（ジャンル/雰囲気/言語/ボーカル/アーティスト）の
 *   選好スコアで実施。いいね・クリック=良い→似た曲、放置/スキップ=悪い→違う曲。
 */
(function () {
  "use strict";

  // ---- 設定値 ----------------------------------------------------------------
  var FADE_MS = 600;        // クロスフェード時間
  var GOOD_DELTA = 1.0;     // 「良い」評価で各特徴に加算
  var BAD_DELTA = 0.34;     // 「悪い」評価で各特徴から減算
  var NO_REPEAT = 6;        // 直近この曲数は再選択しない
  var TEMP = 0.9;           // 選好の効き具合（小さいほど選好を強く反映）

  // ---- 状態 ------------------------------------------------------------------
  var players = {};         // { A: YT.Player, B: YT.Player }
  var ready = { A: false, B: false };
  var slotSong = { A: null, B: null }; // 各スロットに読み込まれている曲
  var activeSlot = "A";     // 現在前面に出ているスロット
  var current = null;       // 再生中の曲
  var preloaded = null;     // 裏で準備済みの曲
  var prefs = {};           // 特徴トークン -> スコア
  var recent = [];          // 直近に流した曲 id
  var blocked = {};         // 再生不可（埋め込み無効/削除等）の曲 id
  var history = [];         // { song, judged, applied } の配列（前後移動用）
  var histIndex = -1;       // history 内の現在位置
  var segTimer = null;      // 区間タイマー
  var progTimer = null;     // プログレス更新
  var enforceTimer = null;  // サビ位置補正の再試行タイマー
  var chorusEnforced = true; // 現在の再生でサビ位置補正済みか
  var apiReady = false;
  var started = false;

  // ---- DOM -------------------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };
  var durationSel = $("duration");
  var filters = { genre: $("genre"), mood: $("mood"), vocal: $("vocal"), lang: $("lang") };

  // ===========================================================================
  // YouTube IFrame API
  // ===========================================================================
  window.onYouTubeIframeAPIReady = function () {
    apiReady = true;
    players.A = makePlayer("playerA", "A");
    players.B = makePlayer("playerB", "B");
  };

  function makePlayer(elId, slot) {
    return new YT.Player(elId, {
      width: "100%",
      height: "100%",
      videoId: "",
      playerVars: {
        controls: 0, disablekb: 1, modestbranding: 1, rel: 0,
        playsinline: 1, iv_load_policy: 3, fs: 0
      },
      events: {
        onReady: function () { ready[slot] = true; onPlayerReady(); },
        onStateChange: function (e) { onState(slot, e); },
        onError: function (e) { onError(slot, e); }
      }
    });
  }

  // 両プレイヤー準備完了で開始ボタンを有効化（必ずクリック操作内で再生開始させる）
  function onPlayerReady() {
    if (ready.A && ready.B) {
      var btn = $("startBtn");
      if (btn) { btn.disabled = false; btn.textContent = "▶ 再生をはじめる"; }
      maybeStart();
    }
  }

  function maybeStart() {
    // 両プレイヤー準備完了 & ユーザーが開始ボタンを押していたら再生開始
    if (ready.A && ready.B && started && !current) playFirst();
  }

  function onState(slot, e) {
    if (slot !== activeSlot) return;
    // 再生が始まったらサビ位置への補正を開始（補正完了後に区間タイマー開始）
    if (e.data === YT.PlayerState.PLAYING) {
      if (!chorusEnforced && !enforceTimer) beginEnforce();
    }
  }

  /*
   * サビ位置補正：startSeconds が無視されたり、読み込み直後のシークが
   * バッファ処理で無効化される YouTube の癖に対応するため、サビ位置に
   * 到達するまで一定間隔でシークを再試行する。到達してから秒数カウント開始。
   */
  function beginEnforce() {
    clearEnforce();
    var tries = 0;
    enforceTimer = setInterval(function () {
      var slot = activeSlot;
      var p = playerFor(slot);
      var song = slotSong[slot];
      if (!p || !song || !p.getCurrentTime) return;
      tries++;

      var state = p.getPlayerState ? p.getPlayerState() : -1;
      if (state !== YT.PlayerState.PLAYING) {
        if (tries > 28) { finishEnforce(); } // ~7秒待っても再生せず→諦めて進める
        return;
      }

      var target = song.chorusStart || 0;
      var t = p.getCurrentTime();
      if (target <= 1 || t >= target - 1.5) {
        finishEnforce();            // サビ到達（または曲頭がサビ）
      } else {
        p.seekTo(target, true);     // まだ手前→シーク（失われても次tickで再試行）
        if (tries > 28) finishEnforce();
      }
    }, 250);
  }

  function finishEnforce() {
    chorusEnforced = true;
    clearEnforce();
    startSegmentTimer();            // サビ到達後に 5〜20秒のカウント開始
  }

  function clearEnforce() {
    if (enforceTimer) { clearInterval(enforceTimer); enforceTimer = null; }
  }

  /*
   * 再生エラー（2:無効ID / 5:再生エラー / 100:削除・非公開 /
   * 101・150:埋め込み無効）。公式MVは埋め込み無効が多いため、
   * その曲はブロックして「表示せずにすぐ別の動画へ」切り替える。
   */
  function onError(slot, e) {
    var song = slotSong[slot];
    if (song) blocked[song.id] = true;

    if (slot === activeSlot) {
      skipUnavailable();          // 今見ている動画が再生不可 → 即スキップ
    } else {
      preloadNext();              // 裏で準備中の動画が再生不可 → 別候補を用意
    }
  }

  // 再生不可の曲を、評価せず・履歴に残さずに飛ばして次へ
  function skipUnavailable() {
    clearTimers();

    // 再生可能な曲が尽きていないかガード
    var playable = window.SONGS.filter(function (s) { return s.id && !blocked[s.id]; });
    if (!playable.length) {
      $("npTitle").textContent = "再生できる曲が見つかりませんでした";
      $("npArtist").textContent = "data.js の曲を見直してください";
      return;
    }

    // 現在のエントリ（再生不可）は履歴から取り除く
    if (histIndex >= 0 && history[histIndex] && history[histIndex].song === current) {
      revertJudgement(history[histIndex]);
      history.splice(histIndex, 1);
      histIndex = Math.min(histIndex, history.length - 1);
    }

    if (!preloaded || blocked[preloaded.id]) preloadNext();
    var next = preloaded;

    crossfadeTo(next);
    current = next;
    history.push({ song: current, judged: null, applied: 0 });
    histIndex = history.length - 1;
    rememberRecent(current.id);
    updateNowPlaying();
    preloadNext();
  }

  // ===========================================================================
  // 選曲アルゴリズム
  // ===========================================================================
  function tokensOf(song) {
    return [
      "genre:" + song.genre,
      "mood:" + song.mood,
      "lang:" + song.lang,
      "vocal:" + song.vocal,
      "artist:" + song.artist
    ];
  }

  function passesFilter(song) {
    var g = filters.genre.value, m = filters.mood.value,
        v = filters.vocal.value, l = filters.lang.value;
    if (g !== "random" && song.genre !== g) return false;
    if (m !== "random" && song.mood !== m) return false;
    if (v !== "random" && song.vocal !== v) return false;
    if (l !== "random" && song.lang !== l) return false;
    return true;
  }

  function scoreOf(song) {
    var s = 0, t = tokensOf(song);
    for (var i = 0; i < t.length; i++) s += (prefs[t[i]] || 0);
    return s;
  }

  // 選好スコアに基づく重み付きランダム選曲（条件フィルタ適用）
  function pickNext(excludeId) {
    var notBlocked = window.SONGS.filter(function (s) { return s.id && !blocked[s.id]; });

    // 1) 条件一致・現在の曲・直近の曲を除外
    var pool = notBlocked.filter(function (s) {
      return s.chorusStart >= 0 && passesFilter(s) &&
             s.id !== excludeId && recent.indexOf(s.id) === -1;
    });
    // 2) 直近除外をはずす（現在の曲は引き続き除外）
    if (!pool.length) {
      pool = notBlocked.filter(function (s) {
        return passesFilter(s) && s.id !== excludeId;
      });
    }
    // 3) フィルタもはずす（現在の曲は引き続き除外＝同じ動画の連続を防ぐ）
    if (!pool.length) {
      pool = notBlocked.filter(function (s) { return s.id !== excludeId; });
    }
    // 4) 最後の手段：再生可能曲が現在の曲しかない場合のみ重複を許可
    if (!pool.length) pool = notBlocked;
    if (!pool.length) pool = window.SONGS.slice();

    // softmax 風の重み付け
    var weights = pool.map(function (s) { return Math.exp(scoreOf(s) / TEMP); });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  function rememberRecent(id) {
    recent.push(id);
    if (recent.length > NO_REPEAT) recent.shift();
  }

  // 評価の適用（applied を保持し、前の動画クリック時に取り消せるように）
  function applyJudgement(entry, judge) {
    if (entry.judged === judge) return;
    revertJudgement(entry); // 既存の評価を一旦取り消し
    var delta = judge === "good" ? GOOD_DELTA : -BAD_DELTA;
    var t = tokensOf(entry.song);
    for (var i = 0; i < t.length; i++) {
      prefs[t[i]] = (prefs[t[i]] || 0) + delta;
    }
    entry.judged = judge;
    entry.applied = delta;
  }

  function revertJudgement(entry) {
    if (!entry.applied) return;
    var t = tokensOf(entry.song);
    for (var i = 0; i < t.length; i++) {
      prefs[t[i]] = (prefs[t[i]] || 0) - entry.applied;
    }
    entry.applied = 0;
    entry.judged = null;
  }

  // ===========================================================================
  // 再生制御
  // ===========================================================================
  function playerFor(slot) { return players[slot]; }
  function otherSlot(slot) { return slot === "A" ? "B" : "A"; }

  function loadInto(slot, song, autoplay) {
    var p = playerFor(slot);
    if (!p || !song) return;
    slotSong[slot] = song;
    if (autoplay) {
      chorusEnforced = false; // 新しい再生：サビ位置補正を再判定
      p.loadVideoById({ videoId: song.id, startSeconds: song.chorusStart });
    } else {
      // プリロード（サビ位置からバッファ）
      p.cueVideoById({ videoId: song.id, startSeconds: song.chorusStart });
    }
  }

  function setSlotActive(slot) {
    $("slot" + slot).classList.add("active");
    $("slot" + otherSlot(slot)).classList.remove("active");
  }

  function playFirst() {
    current = pickNext(null);
    histIndex = 0;
    history = [{ song: current, judged: null, applied: 0 }];
    rememberRecent(current.id);

    loadInto(activeSlot, current, true);
    setSlotActive(activeSlot);
    updateNowPlaying();
    preloadNext();
  }

  // 次の曲を裏のスロットへプリロード
  function preloadNext() {
    preloaded = pickNext(current ? current.id : null);
    loadInto(otherSlot(activeSlot), preloaded, false);
  }

  // 区間タイマー：指定秒経過で「自動切替（=悪い評価）」
  function startSegmentTimer() {
    clearTimers();
    var dur = parseInt(durationSel.value, 10) || 5;
    var startAt = Date.now();

    progTimer = setInterval(function () {
      var ratio = Math.min(1, (Date.now() - startAt) / (dur * 1000));
      $("progressBar").style.width = (ratio * 100) + "%";
    }, 60);

    segTimer = setTimeout(function () {
      advance("auto"); // 最後まで流した = 好みでない
    }, dur * 1000);
  }

  function clearTimers() {
    if (segTimer) { clearTimeout(segTimer); segTimer = null; }
    if (progTimer) { clearInterval(progTimer); progTimer = null; }
    clearEnforce();
    $("progressBar").style.width = "0%";
  }

  /*
   * 次の曲へ進む。
   * reason: "auto"(時間切れ)|"skip"(手動スキップ) は悪い評価、
   *         "like" は良い評価としてから次へ。
   */
  function advance(reason) {
    if (!current) return;
    clearTimers();

    var entry = history[histIndex];
    if (reason === "like") {
      applyJudgement(entry, "good");
    } else {
      // auto / skip。ただし既に good 判定済みなら尊重して上書きしない。
      if (entry.judged !== "good") applyJudgement(entry, "bad");
    }

    // 履歴の途中から進む場合は先のものを破棄
    if (histIndex < history.length - 1) {
      history = history.slice(0, histIndex + 1);
    }

    crossfadeTo(preloaded);

    current = preloaded;
    history.push({ song: current, judged: null, applied: 0 });
    histIndex = history.length - 1;
    rememberRecent(current.id);
    updateNowPlaying();
    preloadNext();
  }

  // クロスフェードで裏のスロットへ。必ずサビ(chorusStart)から再生する。
  function crossfadeTo(song) {
    var from = activeSlot, to = otherSlot(activeSlot);
    var pTo = playerFor(to);
    // プリロード済みでも確実にサビ頭から始めるため startSeconds を明示して読み込む
    chorusEnforced = false; // 新しい再生：サビ位置補正を再判定
    pTo.loadVideoById({ videoId: song.id, startSeconds: song.chorusStart });
    slotSong[to] = song;
    setSlotActive(to);
    activeSlot = to;
    // フェード後に裏のプレイヤーを停止
    setTimeout(function () {
      try { playerFor(from).stopVideo(); } catch (e) {}
    }, FADE_MS + 50);
  }

  // 前の動画へ
  function goPrev() {
    if (histIndex <= 0) return;
    clearTimers();
    histIndex -= 1;
    var entry = history[histIndex];
    current = entry.song;
    preloaded = history[histIndex + 1] ? history[histIndex + 1].song : null;

    // 裏スロットへ読み込んでフェードで前面に
    var to = otherSlot(activeSlot);
    loadInto(to, current, true);
    setSlotActive(to);
    activeSlot = to;
    updateNowPlaying();

    // 戻った先の「次」はプリロードし直す
    preloadNext();
  }

  // ===========================================================================
  // ユーザー操作
  // ===========================================================================
  function likeCurrent() {
    if (!current) return;
    applyJudgement(history[histIndex], "good");
    flashLike();
    updateNowPlaying();
    advance("like"); // 良い → 似た曲へ
  }

  // 動画クリック：YouTube公式を開く + 良い判定（似た曲を優先）
  function clickVideo() {
    if (!current) return;
    applyJudgement(history[histIndex], "good");
    updateNowPlaying();
    rememberRecent(current.id);
    preloadNext(); // 次の候補を「良い」基準で取り直す
    window.open("https://www.youtube.com/watch?v=" + current.id, "_blank", "noopener");
  }

  function flashLike() {
    var b = $("likeBtn");
    b.classList.add("liked");
    setTimeout(function () { b.classList.remove("liked"); }, 600);
  }

  function updateNowPlaying() {
    if (!current) return;
    $("npTitle").textContent = current.title;
    $("npArtist").textContent = current.artist;
    var badge = $("npJudge");
    var j = history[histIndex] && history[histIndex].judged;
    badge.className = "np-badge" + (j ? " " + j : "");
    badge.textContent = j === "good" ? "好み" : (j === "bad" ? "スキップ" : "");
    $("likeBtn").classList.toggle("liked", j === "good");
  }

  // ===========================================================================
  // 初期化 / イベント
  // ===========================================================================
  function start() {
    if (started) return;
    // プレイヤー未準備ならまだ開始しない（自動再生ブロックで止まるのを防ぐ）
    if (!(apiReady && ready.A && ready.B)) return;
    started = true;
    $("startOverlay").classList.add("hidden");
    playFirst(); // 必ずクリック操作の中で再生開始 → 音ありで再生される
  }

  document.addEventListener("DOMContentLoaded", function () {
    // 準備完了まで開始ボタンを無効化（onPlayerReady で有効化）
    var sb = $("startBtn");
    sb.disabled = true;
    sb.textContent = "読み込み中…";
    sb.addEventListener("click", start);
    // API がすでに準備済みなら（稀）ボタンを有効化
    onPlayerReady();
    $("nextBtn").addEventListener("click", function () { advance("skip"); });
    $("prevBtn").addEventListener("click", goPrev);
    $("likeBtn").addEventListener("click", likeCurrent);

    // 動画クリック（透明レイヤー）
    document.querySelectorAll(".click-catch").forEach(function (el) {
      el.addEventListener("click", clickVideo);
    });

    // フィルタ変更時：次のプリロード候補を取り直す
    Object.keys(filters).forEach(function (k) {
      filters[k].addEventListener("change", function () {
        if (current) preloadNext();
      });
    });
    // 再生秒数変更：再生中なら区間タイマーを引き直し
    durationSel.addEventListener("change", function () {
      if (current && segTimer) startSegmentTimer();
    });
  });
})();
