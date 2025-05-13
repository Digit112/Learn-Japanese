// Contains dictionaries in the question-answer form.

const hiragana = {
	"あ": "a",  "い": "i",  "う":  "u",   "え": "e",  "お": "o",
	"か": "ka", "き": "ki", "く":  "ku",  "け": "ke", "こ": "ko",
	"さ": "sa", "し": "shi", "す": "su",  "せ": "se", "そ": "so",
	"た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
	"な": "na", "に": "ni", "ぬ": "nu",  "ね": "ne", "の": "no",
	"は": "ha", "ひ": "hi", "ふ": "fu",  "へ": "he", "ほ": "ho",
	"ま": "ma", "み": "mi", "む": "mu",  "め": "me", "も": "mo",
	"や": "ya",            "ゆ": "yu",              "よ": "yo",
	"ら": "ra", "り": "ri", "る": "ru",  "れ": "re", "ろ": "ro",
	"わ": "wa", "ゐ": "wi",             "ゑ": "we", "を": "wo",
	"ん": "n"
}

const hiragana_diacritics = {
	"が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
	"ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
	"だ": "da", "ぢ": "ji", "づ": "du", "で": "de", "ど": "do",
	"ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
	"ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po"
}

const hiragana_digraphs = {
	"きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
	"しゃ": "sha", "しゅ": "shu", "しょ": "sho",
	"ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho",
	"にゃ": "nya", "にゅ": "nyu", "にょ": "nyo",
	"ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
	"みゃ": "mya", "みゅ": "myu", "みょ": "myo",
	"りゃ": "rya", "りゅ": "ryu", "りょ": "ryo"
}

const hiragana_digraphs_diacritics = {
	"ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
	"じゃ": "ja",  "じゅ": "ju",  "じょ": "jo",
	"びゃ": "bya", "びゅ": "byu", "びょ": "byo",
	"ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo"
}

const hiragana_jajujo_alternates = {
	"ぢゃ": "ja", "ぢゅ": "ju", "ぢょ": "jo"
}

const katakana = {
	"ア": "a",  "イ": "i",   "ウ": "u",   "エ": "e",  "オ": "o",
	"カ": "ka", "キ": "ki",  "ク": "ku",  "ケ": "ke", "コ": "ko",
	"サ": "sa", "シ": "shi", "ス": "su",  "セ": "se", "ソ": "so",
	"タ": "ta", "チ": "chi", "ツ": "tsu", "テ": "te", "ト": "to",
	"ナ": "na", "ニ": "ni",  "ヌ": "nu",  "ネ": "ne", "ノ": "no",
	"ハ": "ha", "ヒ": "hi",  "フ": "fu",  "ヘ": "he", "ホ": "ho",
	"マ": "ma", "ミ": "mi",  "ム": "mu",  "メ": "me", "モ": "mo",
	"ヤ": "ya",             "ユ": "yu",             "ヨ": "yo",
	"ラ": "ra", "リ": "ri",  "ル": "ru",  "レ": "re", "ロ": "ro",
	"ワ": "wa", "ヰ": "wi",              "ヱ": "we", "ヲ": "wo",
	"ン": "n"
}

const katakana_diacritics = {
	"ガ": "ga", "ギ": "gi", "グ": "gu", "ゲ": "ge", "ゴ": "go",
	"ザ": "za", "ジ": "ji", "ズ": "zu", "ゼ": "ze", "ゾ": "zo",
	"ダ": "da", "ヂ": "di", "ヅ": "du", "デ": "de", "ド": "do",
	"バ": "ba", "ビ": "bi", "ブ": "bu", "ベ": "be", "ボ": "bo",
	"パ": "pa", "ピ": "pi", "プ": "pu", "ペ": "pe", "ポ": "po"
}

const katakana_digraphs = {
	"キャ": "kya", "キュ": "kyu", "キョ": "kyo",
	"シャ": "sha", "シュ": "shu", "ショ": "sho",
	"チャ": "cha", "チュ": "chu", "チョ": "cho",
	"ニャ": "nya", "ニュ": "nyu", "ニョ": "nyo",
	"ヒャ": "hya", "ヒュ": "hyu", "ヒョ": "hyo",
	"ミャ": "mya", "ミュ": "myu", "ミョ": "myo",
	"リャ": "rya", "リュ": "ryu", "リョ": "ryo",
}

const katakana_digraphs_diacritics = {
	"ギャ": "gya", "ギュ": "gyu", "ギョ": "gyo",
	"ジャ": "ja",  "ジュ": "ju",  "ジョ": "jo",
	"ビャ": "bya", "ビュ": "byu", "ビョ": "byo",
	"ピャ": "pya", "ピュ": "pyu", "ピョ": "pyo",
}

const katakana_jajujo_alternates = {
	"チャ": "ja", "チュ": "ju", "チョ": "jo",
}

const polite_words = {
	"こんにちは": "hello",
	"おはよう": "good morning",
	"こんばんは": "good evening",
	"おやすみ": ["good night (informal)", "good night"],
	"ありがとう": ["thank you (informal)", "thank you"],
	"ありがとう": ["thank you (formal)", "thank you"],
}

const kana_numbers_0_9 = {
	"ぜろ": "0",
	"いち": "1",
	"に": "2",
	"さん": "3",
	"よん": "4",
	"ご": "5",
	"ろく": "6",
	"なな": "7",
	"はち": "8",
	"きゅう": "9",
}

const kana_numbers_0_4_7_9_alt = {
	"れい": "0",
	"し": "4",
	"よ": "4",
	"しち": "7",
	"く": "9",
}

const kana_numbers_10_100_1000_10000 = {
	"じゅう": "10",
	"ひゃく": "100",
	"せん": "1000",
	"いちまん": "10000",
}

const kana_nouns_school = {
	"だいがく": ["college", "university"],
	"こうこう": "high school",
	"がくせい": "student",
	"こうこうせい": "high school student",
	"だいがくせい": "college student",
	"だいがくいんせい": "graduate student",
	"りゅうがくせい": "international student",
	"せんこう": "major",
}

const kana_nouns_countries = {
	"にほん": "japan",
	"かんこく": "korea",
	"ちゅうごく": "china",
	"アメリカ": ["america", "usa"],
	"メキシコ": "mexico",
	"イギリス": ["england", "britain"],
	"ロシア": "russia",
	"インドネシア": "indonesia",
	"インド": "india",
	"フイリピン": "philippines",
	"カナダ": "canada",
	"エジプト": "egypt",
	"オーストラリア": "australia",
}

const kana_nouns_majors = {
	"コンピューター": "computer",
	"せいぶつがく": "biology",
	"こうがく": "engineering",
	"けいざい": "economics",
	"ビジネス": "business",
	"せいぢ": "politics",
	"ぶんがく": "literature",
	"れきし": "history",
	"アジアけんきゅ": "asian studies",
}

const kana_nouns_jobs = {
	"いしゃ": "doctor",
	"かいしゃいん": "office worker",
	"かんごし": "nurse",
	"べんごし": "lawyer",
}
	