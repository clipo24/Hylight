/*
 * Hylight 楽曲カタログ（埋め込みOK中心）
 * -----------------------------------------------------------------------------
 * 埋め込み・共有が公式に許可されている著作権フリー音楽（NoCopyrightSounds = NCS
 * 等）を中心に収録しています。これらは埋め込み再生がブロックされにくいため
 * 「動画を再生できません」が起きにくく、サビ（ドロップ）から快適に流せます。
 *
 * ※ 実行環境から YouTube への接続がネットワークポリシーで遮断されているため、
 *   各IDの実在・埋め込み可否は事前検証できていません。万一再生できないIDが
 *   あっても、アプリ側が自動でスキップ＆ブロックし、一度出した曲は二度と
 *   表示しません。再生できない曲が多い場合はIDを差し替えてください。
 *
 * 各フィールド:
 *   id          : YouTube の videoId（https://youtu.be/<id>）
 *   title       : 曲名
 *   artist      : アーティスト名
 *   genre       : pop | rock | rnb | dance | ballad
 *   mood        : bright | dark | sad | chill | energetic
 *   lang        : jp | en
 *   vocal       : vocal | inst
 *   chorusStart : サビ（インスト/EDMはドロップ＝盛り上がり）開始秒
 * -----------------------------------------------------------------------------
 */
window.SONGS = [
  // ===== NCS / 著作権フリー（埋め込みOK想定） =====
  { id: "bM7SZ5SBzyY", title: "Fade",                 artist: "Alan Walker",                 genre: "dance", mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 59 },
  { id: "AOeY-nDp7hI", title: "Spectre",              artist: "Alan Walker",                 genre: "dance", mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 60 },
  { id: "K4DyBUG242c", title: "On & On (ft. Daniel Levi)", artist: "Cartoon",                genre: "dance", mood: "bright",    lang: "en", vocal: "vocal", chorusStart: 60 },
  { id: "3nQNiWdeH2Q", title: "Heroes Tonight (ft. Johnning)", artist: "Janji",              genre: "dance", mood: "bright",    lang: "en", vocal: "vocal", chorusStart: 60 },
  { id: "TW9d8vYrVFQ", title: "Sky High",             artist: "Elektronomia",                genre: "dance", mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 71 },
  { id: "J2X5mJ3HDYE", title: "Invincible",           artist: "DEAF KEV",                    genre: "dance", mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 79 },
  { id: "jK2aIUmmdP4", title: "My Heart (ft. EH!DE)", artist: "Different Heaven",            genre: "rock",  mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 60 },
  { id: "EP625xQIGzs", title: "Hope",                 artist: "Tobu",                        genre: "dance", mood: "bright",    lang: "en", vocal: "inst",  chorusStart: 56 },
  { id: "VtKbiyyVZks", title: "Cloud 9",              artist: "Itro & Tobu",                 genre: "dance", mood: "bright",    lang: "en", vocal: "inst",  chorusStart: 60 },
  { id: "p7ZsBPK656s", title: "Blank",                artist: "Disfigure",                   genre: "dance", mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 72 },
  { id: "__CRWE-L45k", title: "Symbolism",            artist: "Electro-Light",               genre: "dance", mood: "bright",    lang: "en", vocal: "inst",  chorusStart: 60 },
  { id: "yJg-Y5byMBw", title: "Different Heaven - Nekozilla", artist: "Different Heaven",     genre: "rock",  mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 60 },
  { id: "8GW6sLrK40k", title: "Why We Lose (ft. Coleman Trapp)", artist: "Cartoon",          genre: "dance", mood: "sad",       lang: "en", vocal: "vocal", chorusStart: 70 },
  { id: "60ItHLz5WEA", title: "Faded",                artist: "Alan Walker",                 genre: "dance", mood: "sad",       lang: "en", vocal: "vocal", chorusStart: 80 },
  { id: "yKlYJjGFXM4", title: "Janji - Heroes",       artist: "Janji",                       genre: "dance", mood: "bright",    lang: "en", vocal: "inst",  chorusStart: 58 },
  { id: "pgN-vvVVuMA", title: "Dawn",                 artist: "Skylike",                     genre: "dance", mood: "chill",     lang: "en", vocal: "inst",  chorusStart: 55 },
  { id: "vBGiFtb8Rpw", title: "Mortals (ft. Laura Brehm)", artist: "Warriyo",                genre: "dance", mood: "energetic", lang: "en", vocal: "vocal", chorusStart: 76 },
  { id: "PKfxmFU3lWY", title: "Find Me",              artist: "Unknown Brain",               genre: "dance", mood: "bright",    lang: "en", vocal: "vocal", chorusStart: 70 },
  { id: "RfP4D7gVi3c", title: "Lights",               artist: "Spektrem",                    genre: "dance", mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 62 },
  { id: "qpGsnD8E2_8", title: "Time Leap",            artist: "Andromedik",                  genre: "rock",  mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 55 },
  { id: "fM__lZkVnEM", title: "We Are (ft. Drowsy)",  artist: "T-Mass & Frainbreeze",        genre: "dance", mood: "bright",    lang: "en", vocal: "vocal", chorusStart: 60 },
  { id: "n4tK7LYFvI0", title: "Force",                artist: "Alan Walker & YA & Sasrita",  genre: "dance", mood: "energetic", lang: "en", vocal: "inst",  chorusStart: 58 },
];
