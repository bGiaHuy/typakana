export type VocabularyGroup = "all" | "original" | "new" | "numbers"
export type PronunciationMode = "hiragana" | "romaji"
export type MeaningLanguage = "vietnamese" | "english"
export interface KanjiItem {
	id: string
	kanji: string
	hiragana: string[]
	romaji: string[]
	meaning: string
	acceptedMeanings: string[]
	englishMeanings: string[]
	group: Exclude<VocabularyGroup, "all">
	lesson: 1 | 2 | 3
	note?: string
}

const englishMeanings: Record<string, string[]> = {
	月: ["moon", "month"], 月曜日: ["Monday"], 一月: ["January", "January month"],
	火: ["fire"], 火曜日: ["Tuesday"], 水: ["water"], 水曜日: ["Wednesday"],
	木: ["tree", "wood"], 木曜日: ["Thursday"], お金: ["money"], 金曜日: ["Friday"],
	土: ["earth", "soil"], 土曜日: ["Saturday"], 日曜日: ["Sunday"],
	何: ["what"], 年: ["year"], 時: ["hour", "time"], 時半: ["half past", "half an hour"],
	時間: ["time", "hours"], 分: ["minute", "part"], 私: ["I", "me", "myself"],
	人: ["person", "people"], 才: ["years old", "age"], 人才: ["talent", "talented person"],
	学校: ["school"], 学生: ["student"], 日: ["day", "sun"], 日本: ["Japan"],
	本: ["book"], 語: ["language", "word"], 日本語: ["Japanese", "Japanese language"],
	日本人: ["Japanese person", "Japanese people"], 一: ["one", "1"], 二: ["two", "2"],
	三: ["three", "3"], 四: ["four", "4"], 五: ["five", "5"], 六: ["six", "6"],
	七: ["seven", "7"], 八: ["eight", "8"], 九: ["nine", "9"], 十: ["ten", "10"],
	百: ["one hundred", "hundred", "100"], 千: ["one thousand", "thousand", "1000"],
	万: ["ten thousand", "ten thousand (man)", "10000"], 円: ["yen"]
}
const original = [
	["月", "つき", "tsuki", "trăng, tháng", "trăng|mặt trăng|tháng|trăng, tháng"],
	["月曜日", "げつようび", "getsuyoubi", "thứ hai", "thứ hai|thứ 2"],
	["一月", "いちがつ", "ichigatsu", "tháng 1", "tháng 1|tháng một|tháng giêng"],
	["火", "ひ", "hi", "lửa", "lửa|ngọn lửa"],
	["火曜日", "かようび", "kayoubi", "thứ ba", "thứ ba|thứ 3"],
	["水", "みず", "mizu", "nước", "nước"],
	["水曜日", "すいようび", "suiyoubi", "thứ tư", "thứ tư|thứ 4"],
	["木", "き", "ki", "cây", "cây|cây cối"],
	["木曜日", "もくようび", "mokuyoubi", "thứ năm", "thứ năm|thứ 5"],
	["お金", "おかね", "okane", "tiền", "tiền|tiền bạc"],
	["金曜日", "きんようび", "kinyoubi", "thứ sáu", "thứ sáu|thứ 6"],
	["土", "つち", "tsuchi", "đất", "đất"],
	["土曜日", "どようび", "doyoubi", "thứ bảy", "thứ bảy|thứ 7"],
	["日曜日", "にちようび", "nichiyoubi", "chủ nhật", "chủ nhật|chúa nhật|cn"],
	["何", "なん|なに", "nan|nani", "cái gì", "cái gì|gì"],
	["年", "ねん", "nen", "năm", "năm"],
	["時", "じ", "ji", "giờ", "giờ"],
	["時半", "じはん", "jihan", "giờ rưỡi", "giờ rưỡi"],
	["時間", "じかん", "jikan", "thời gian", "thời gian"],
	["分", "ふん", "fun", "phút", "phút"]
]
const added = [
	["私", "わたし", "watashi", "tôi", "tôi|mình|tớ"],
	["人", "ひと", "hito", "người", "người|con người"],
	["才", "さい", "sai", "tuổi", "tuổi"],
	["人才", "じんさい", "jinsai", "nhân tài", "nhân tài|người tài"],
	["学校", "がっこう", "gakkou", "trường học", "trường học|trường"],
	[
		"学生",
		"がくせい",
		"gakusei",
		"học sinh, sinh viên",
		"học sinh|sinh viên|học sinh, sinh viên"
	],
	["日", "ひ", "hi", "ngày", "ngày"],
	["日本", "にほん", "nihon", "Nhật Bản", "nhật bản|nước nhật|nhật"],
	["本", "ほん", "hon", "sách", "sách|quyển sách|cuốn sách"],
	["語", "ご", "go", "tiếng, ngôn ngữ", "tiếng|ngôn ngữ|tiếng, ngôn ngữ"],
	[
		"日本語",
		"にほんご",
		"nihongo",
		"tiếng Nhật",
		"tiếng nhật|nhật ngữ|ngôn ngữ nhật bản"
	],
	[
		"日本人",
		"にほんじん",
		"nihonjin",
		"người Nhật",
		"người nhật|người nhật bản"
	]
]
const numbers = [
	["一", "いち", "ichi", "một", "một|1"],
	["二", "に", "ni", "hai", "hai|2"],
	["三", "さん", "san", "ba", "ba|3"],
	["四", "よん", "yon", "bốn", "bốn|4"],
	["五", "ご", "go", "năm", "năm|5"],
	["六", "ろく", "roku", "sáu", "sáu|6"],
	["七", "なな", "nana", "bảy", "bảy|7"],
	["八", "はち", "hachi", "tám", "tám|8"],
	["九", "きゅう", "kyuu", "chín", "chín|9"],
	["十", "じゅう", "juu", "mười", "mười|10"],
	["百", "ひゃく", "hyaku", "một trăm", "một trăm|trăm|100"],
	[
		"千",
		"せん",
		"sen",
		"một nghìn",
		"một nghìn|một ngàn|nghìn|ngàn|1000|1.000"
	],
	[
		"万",
		"まん",
		"man",
		"mười nghìn (vạn)",
		"mười nghìn|mười ngàn|vạn|một vạn|mười nghìn (vạn)|10000|10.000"
	],
	["円", "えん", "en", "yên", "yên|đồng yên|yên nhật"]
]
export const lessons = [
	{ id: 1, title: "Bài 1", description: "Con người, trường học và tiếng Nhật" },
	{ id: 2, title: "Bài 2", description: "Số đếm và tiền tệ" },
	{ id: 3, title: "Bài 3", description: "Ngày trong tuần và thời gian" }
] as const
export function selectLessons(ids: readonly number[]) {
	return vocabulary.filter((item) => ids.includes(item.lesson))
}
function items(rows: string[][], group: KanjiItem["group"]): KanjiItem[] {
	return rows.map(([kanji, hiragana, romaji, meaning, synonyms], index) => ({
		id: `${group}-${index + 1}`,
		kanji,
		hiragana: hiragana.split("|"),
		romaji: romaji.split("|"),
		meaning,
		acceptedMeanings: synonyms.split("|"),
		englishMeanings: englishMeanings[kanji] ?? [meaning],
		group,
		lesson: group === "original" ? 3 : group === "numbers" ? 2 : 1,
		...(kanji === "人才"
			? {
					note: "Giữ nguyên 人才（じんさい）theo bộ từ được cung cấp; phân biệt với từ thường dùng 人材（じんざい）."
				}
			: {})
	}))
}
export const vocabulary: KanjiItem[] = [
	...items(original, "original"),
	...items(added, "new"),
	...items(numbers, "numbers")
]
export function selectVocabulary(group: VocabularyGroup) {
	return vocabulary.filter((item) => group === "all" || item.group === group)
}
