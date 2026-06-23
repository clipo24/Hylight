/*
 * Hylight 楽曲カタログ
 * -----------------------------------------------------------------------------
 * すべて「公式チャンネル（公式アーティスト / VEVO 等）」にアップロードされている
 * 楽曲を想定してキュレーションしています。video ID は公式アップロードを指します。
 * （再生できないものがあれば、その曲だけ差し替え / 削除してください）
 *
 * 各フィールド:
 *   id          : YouTube の videoId（https://youtu.be/<id>）
 *   title       : 曲名
 *   artist      : アーティスト名
 *   genre       : pop | rock | rnb | dance | ballad
 *   mood        : bright | dark | sad | chill | energetic
 *   lang        : jp | en          （邦楽 / 洋楽）
 *   vocal       : vocal | inst      （歌あり / インスト）
 *   chorusStart : サビ（インストは盛り上がり/フック）開始秒。ここから必ず再生。
 * -----------------------------------------------------------------------------
 */
window.SONGS = [
  // ===== 邦楽 (jp) =====
  { id: "ZRtdQ81jPUQ", title: "アイドル",         artist: "YOASOBI",            genre: "pop",    mood: "energetic", lang: "jp", vocal: "vocal", chorusStart: 53 },
  { id: "TQ8WlA2GXbk", title: "Pretender",        artist: "Official髭男dism",   genre: "pop",    mood: "bright",    lang: "jp", vocal: "vocal", chorusStart: 60 },
  { id: "SX_ViT4Ra7k", title: "Lemon",            artist: "米津玄師",            genre: "ballad", mood: "sad",       lang: "jp", vocal: "vocal", chorusStart: 61 },
  { id: "ony539T074w", title: "白日",             artist: "King Gnu",           genre: "rock",   mood: "dark",      lang: "jp", vocal: "vocal", chorusStart: 72 },
  { id: "GZjt_sA2eso", title: "ドライフラワー",   artist: "優里",                genre: "ballad", mood: "sad",       lang: "jp", vocal: "vocal", chorusStart: 64 },
  { id: "rJGUTaJWBYw", title: "怪獣の花唄",       artist: "Vaundy",             genre: "rock",   mood: "bright",    lang: "jp", vocal: "vocal", chorusStart: 58 },
  { id: "Qp3b-RXtz4w", title: "うっせぇわ",       artist: "Ado",                genre: "rock",   mood: "dark",      lang: "jp", vocal: "vocal", chorusStart: 49 },
  { id: "kIyiD2Nfc14", title: "残響散歌",         artist: "Aimer",              genre: "rock",   mood: "energetic", lang: "jp", vocal: "vocal", chorusStart: 50 },
  { id: "CwkzK-F0Y00", title: "紅蓮華",           artist: "LiSA",               genre: "rock",   mood: "energetic", lang: "jp", vocal: "vocal", chorusStart: 54 },
  { id: "5y_Rh51tNBo", title: "夜に駆ける",       artist: "YOASOBI",            genre: "pop",    mood: "bright",    lang: "jp", vocal: "vocal", chorusStart: 48 },

  // ===== 洋楽 (en) =====
  { id: "4NRXx6U8ABQ", title: "Blinding Lights",  artist: "The Weeknd",         genre: "pop",    mood: "energetic", lang: "en", vocal: "vocal", chorusStart: 56 },
  { id: "TUVcZfQe-Kw", title: "Levitating",       artist: "Dua Lipa",           genre: "dance",  mood: "bright",    lang: "en", vocal: "vocal", chorusStart: 49 },
  { id: "JGwWNGJdvx8", title: "Shape of You",     artist: "Ed Sheeran",         genre: "pop",    mood: "bright",    lang: "en", vocal: "vocal", chorusStart: 44 },
  { id: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody",artist: "Queen",              genre: "rock",   mood: "dark",      lang: "en", vocal: "vocal", chorusStart: 175 },
  { id: "dvgZkm1xWPE", title: "Viva la Vida",     artist: "Coldplay",           genre: "rock",   mood: "bright",    lang: "en", vocal: "vocal", chorusStart: 38 },
  { id: "7wtfhZwyrcc", title: "Believer",         artist: "Imagine Dragons",    genre: "rock",   mood: "energetic", lang: "en", vocal: "vocal", chorusStart: 60 },
  { id: "OPf0YbXqDm0", title: "Uptown Funk",      artist: "Mark Ronson ft. Bruno Mars", genre: "rnb", mood: "bright", lang: "en", vocal: "vocal", chorusStart: 73 },
  { id: "rYEDA3JcQqw", title: "Rolling in the Deep", artist: "Adele",           genre: "rnb",    mood: "dark",      lang: "en", vocal: "vocal", chorusStart: 49 },
  { id: "09R8_2nJtjg", title: "Sugar",            artist: "Maroon 5",           genre: "pop",    mood: "bright",    lang: "en", vocal: "vocal", chorusStart: 49 },
  { id: "DyDfgMOUjCI", title: "bad guy",          artist: "Billie Eilish",      genre: "pop",    mood: "dark",      lang: "en", vocal: "vocal", chorusStart: 14 },

  // ===== インスト (inst) =====
  { id: "aHjpOzsQ9YI", title: "Crystallize",      artist: "Lindsey Stirling",   genre: "dance",  mood: "energetic", lang: "en", vocal: "inst", chorusStart: 64 },
  { id: "OHwDi2zN8-c", title: "Roundtable Rival",  artist: "Lindsey Stirling",   genre: "rock",   mood: "energetic", lang: "en", vocal: "inst", chorusStart: 40 },
];
