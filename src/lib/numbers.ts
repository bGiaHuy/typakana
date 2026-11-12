export interface NumberDefinition {
	id: string
	kanji: string
	arabic: string
	reading: string
	romaji: string[]
	label?: string
}

export interface NumberCategory {
	id: string
	name: string
	description: string
	rows: NumberDefinition[][]
}

export const numberCategories: NumberCategory[] = [
	{
		id: "basic",
		name: "Basic (0 – 10)",
		description: "Số cơ bản 0 - 10",
		rows: [
			[
				{
					id: "num_0",
					kanji: "零",
					arabic: "0",
					reading: "れい",
					romaji: ["rei", "zero"],
					label: "0"
				},
				{
					id: "num_1",
					kanji: "一",
					arabic: "1",
					reading: "いち",
					romaji: ["ichi"],
					label: "1"
				},
				{
					id: "num_2",
					kanji: "二",
					arabic: "2",
					reading: "に",
					romaji: ["ni"],
					label: "2"
				},
				{
					id: "num_3",
					kanji: "三",
					arabic: "3",
					reading: "さん",
					romaji: ["san"],
					label: "3"
				},
				{
					id: "num_4",
					kanji: "四",
					arabic: "4",
					reading: "よん",
					romaji: ["yon", "shi"],
					label: "4"
				}
			],
			[
				{
					id: "num_5",
					kanji: "五",
					arabic: "5",
					reading: "ご",
					romaji: ["go"],
					label: "5"
				},
				{
					id: "num_6",
					kanji: "六",
					arabic: "6",
					reading: "ろく",
					romaji: ["roku"],
					label: "6"
				},
				{
					id: "num_7",
					kanji: "七",
					arabic: "7",
					reading: "なな",
					romaji: ["nana", "shichi"],
					label: "7"
				},
				{
					id: "num_8",
					kanji: "八",
					arabic: "8",
					reading: "はち",
					romaji: ["hachi"],
					label: "8"
				},
				{
					id: "num_9",
					kanji: "九",
					arabic: "9",
					reading: "きゅう",
					romaji: ["kyuu", "kyu", "ku"],
					label: "9"
				},
				{
					id: "num_10",
					kanji: "十",
					arabic: "10",
					reading: "じゅう",
					romaji: ["juu", "ju", "jyuu", "zyu"],
					label: "10"
				}
			]
		]
	},
	{
		id: "tens",
		name: "Tens & Hundreds (11 – 10,000)",
		description: "11-20 & Hàng trăm, nghìn",
		rows: [
			[
				{
					id: "num_11",
					kanji: "十一",
					arabic: "11",
					reading: "じゅういち",
					romaji: ["juuichi", "juichi"]
				},
				{
					id: "num_12",
					kanji: "十二",
					arabic: "12",
					reading: "じゅうに",
					romaji: ["juuni", "juni"]
				},
				{
					id: "num_13",
					kanji: "十三",
					arabic: "13",
					reading: "じゅうさん",
					romaji: ["juusan", "jusan"]
				},
				{
					id: "num_14",
					kanji: "十四",
					arabic: "14",
					reading: "じゅうよん",
					romaji: ["juuyon", "juushi", "juyon", "jushi"]
				},
				{
					id: "num_15",
					kanji: "十五",
					arabic: "15",
					reading: "じゅうご",
					romaji: ["juugo", "jugo"]
				}
			],
			[
				{
					id: "num_16",
					kanji: "十六",
					arabic: "16",
					reading: "じゅうろく",
					romaji: ["juuroku", "juroku"]
				},
				{
					id: "num_17",
					kanji: "十七",
					arabic: "17",
					reading: "じゅうなな",
					romaji: ["juunana", "juushichi", "junana", "jushichi"]
				},
				{
					id: "num_18",
					kanji: "十八",
					arabic: "18",
					reading: "じゅうはち",
					romaji: ["juuhachi", "juhachi"]
				},
				{
					id: "num_19",
					kanji: "十九",
					arabic: "19",
					reading: "じゅうきゅう",
					romaji: ["juukyuu", "juuku", "jukyuu", "juku"]
				},
				{
					id: "num_20",
					kanji: "二十",
					arabic: "20",
					reading: "にじゅう",
					romaji: ["nijuu", "niju"]
				}
			],
			[
				{
					id: "num_30",
					kanji: "三十",
					arabic: "30",
					reading: "さんじゅう",
					romaji: ["sanjuu", "sanju"]
				},
				{
					id: "num_40",
					kanji: "四十",
					arabic: "40",
					reading: "よんじゅう",
					romaji: ["yonjuu", "yonju"]
				},
				{
					id: "num_50",
					kanji: "五十",
					arabic: "50",
					reading: "ごじゅう",
					romaji: ["gojuu", "goju"]
				},
				{
					id: "num_60",
					kanji: "六十",
					arabic: "60",
					reading: "ろくじゅう",
					romaji: ["rokujuu", "rokuju"]
				},
				{
					id: "num_70",
					kanji: "七十",
					arabic: "70",
					reading: "ななじゅう",
					romaji: ["nanajuu", "nanaju", "shichijuu", "shichiju"]
				}
			],
			[
				{
					id: "num_80",
					kanji: "八十",
					arabic: "80",
					reading: "はちじゅう",
					romaji: ["hachijuu", "hachiju"]
				},
				{
					id: "num_90",
					kanji: "九十",
					arabic: "90",
					reading: "きゅうじゅう",
					romaji: ["kyuujuu", "kyuuju"]
				},
				{
					id: "num_100",
					kanji: "百",
					arabic: "100",
					reading: "ひゃく",
					romaji: ["hyaku"]
				},
				{
					id: "num_300",
					kanji: "三百",
					arabic: "300",
					reading: "さんびゃく",
					romaji: ["sanbyaku"]
				},
				{
					id: "num_600",
					kanji: "六百",
					arabic: "600",
					reading: "ろっぴゃく",
					romaji: ["roppyaku"]
				}
			],
			[
				{
					id: "num_800",
					kanji: "八百",
					arabic: "800",
					reading: "はっぴゃく",
					romaji: ["happyaku"]
				},
				{
					id: "num_1000",
					kanji: "千",
					arabic: "1000",
					reading: "せん",
					romaji: ["sen"]
				},
				{
					id: "num_3000",
					kanji: "三千",
					arabic: "3000",
					reading: "さんぜん",
					romaji: ["sanzen"]
				},
				{
					id: "num_8000",
					kanji: "八千",
					arabic: "8000",
					reading: "はっせん",
					romaji: ["hassen"]
				},
				{
					id: "num_10000",
					kanji: "万",
					arabic: "10000",
					reading: "まん",
					romaji: ["man", "ichiman"]
				}
			]
		]
	},
	{
		id: "objects",
		name: "General Objects (~つ)",
		description: "Đếm đồ vật ~つ",
		rows: [
			[
				{
					id: "obj_1",
					kanji: "一つ",
					arabic: "1つ",
					reading: "ひとつ",
					romaji: ["hitotsu"]
				},
				{
					id: "obj_2",
					kanji: "二つ",
					arabic: "2つ",
					reading: "ふたつ",
					romaji: ["futatsu"]
				},
				{
					id: "obj_3",
					kanji: "三つ",
					arabic: "3つ",
					reading: "みっつ",
					romaji: ["mittsu"]
				},
				{
					id: "obj_4",
					kanji: "四つ",
					arabic: "4つ",
					reading: "よっつ",
					romaji: ["yottsu"]
				},
				{
					id: "obj_5",
					kanji: "五つ",
					arabic: "5つ",
					reading: "いつつ",
					romaji: ["itsutsu"]
				}
			],
			[
				{
					id: "obj_6",
					kanji: "六つ",
					arabic: "6つ",
					reading: "むっつ",
					romaji: ["muttsu"]
				},
				{
					id: "obj_7",
					kanji: "七つ",
					arabic: "7つ",
					reading: "ななつ",
					romaji: ["nanatsu"]
				},
				{
					id: "obj_8",
					kanji: "八つ",
					arabic: "8つ",
					reading: "やっつ",
					romaji: ["yattsu"]
				},
				{
					id: "obj_9",
					kanji: "九つ",
					arabic: "9つ",
					reading: "ここのつ",
					romaji: ["kokonotsu"]
				},
				{
					id: "obj_10",
					kanji: "十",
					arabic: "10",
					reading: "とお",
					romaji: ["too", "to"]
				},
				{
					id: "obj_howmany",
					kanji: "幾つ",
					arabic: "いくつ",
					reading: "いくつ",
					romaji: ["ikutsu"]
				}
			]
		]
	},
	{
		id: "people",
		name: "People (~人)",
		description: "Đếm người ~人",
		rows: [
			[
				{
					id: "ppl_1",
					kanji: "一人",
					arabic: "1人",
					reading: "ひとり",
					romaji: ["hitori"]
				},
				{
					id: "ppl_2",
					kanji: "二人",
					arabic: "2人",
					reading: "ふたり",
					romaji: ["futari"]
				},
				{
					id: "ppl_3",
					kanji: "三人",
					arabic: "3人",
					reading: "さんにん",
					romaji: ["sannin"]
				},
				{
					id: "ppl_4",
					kanji: "四人",
					arabic: "4人",
					reading: "よにん",
					romaji: ["yonin"]
				},
				{
					id: "ppl_5",
					kanji: "五人",
					arabic: "5人",
					reading: "ごにん",
					romaji: ["gonin"]
				}
			],
			[
				{
					id: "ppl_6",
					kanji: "六人",
					arabic: "6人",
					reading: "ろくにん",
					romaji: ["rokunin"]
				},
				{
					id: "ppl_7",
					kanji: "七人",
					arabic: "7人",
					reading: "ななにん",
					romaji: ["nananin", "shichinin"]
				},
				{
					id: "ppl_8",
					kanji: "八人",
					arabic: "8人",
					reading: "はちにん",
					romaji: ["hachinin"]
				},
				{
					id: "ppl_9",
					kanji: "九人",
					arabic: "9人",
					reading: "きゅうにん",
					romaji: ["kyuunin", "kunin"]
				},
				{
					id: "ppl_10",
					kanji: "十人",
					arabic: "10人",
					reading: "じゅうにん",
					romaji: ["juunin", "junin"]
				},
				{
					id: "ppl_howmany",
					kanji: "何人",
					arabic: "何人",
					reading: "なんにん",
					romaji: ["nannin"]
				}
			]
		]
	},
	{
		id: "days",
		name: "Days of Month (~日)",
		description: "Đếm ngày trong tháng ~日",
		rows: [
			[
				{
					id: "day_1",
					kanji: "一日",
					arabic: "1日",
					reading: "ついたち",
					romaji: ["tsuitachi"]
				},
				{
					id: "day_2",
					kanji: "二日",
					arabic: "2日",
					reading: "ふつか",
					romaji: ["futsuka"]
				},
				{
					id: "day_3",
					kanji: "三日",
					arabic: "3日",
					reading: "みっか",
					romaji: ["mikka"]
				},
				{
					id: "day_4",
					kanji: "四日",
					arabic: "4日",
					reading: "よっか",
					romaji: ["yokka"]
				},
				{
					id: "day_5",
					kanji: "五日",
					arabic: "5日",
					reading: "いつか",
					romaji: ["itsuka"]
				}
			],
			[
				{
					id: "day_6",
					kanji: "六日",
					arabic: "6日",
					reading: "むいか",
					romaji: ["muika"]
				},
				{
					id: "day_7",
					kanji: "七日",
					arabic: "7日",
					reading: "なのか",
					romaji: ["nanoka"]
				},
				{
					id: "day_8",
					kanji: "八日",
					arabic: "8日",
					reading: "ようか",
					romaji: ["yooka", "youka"]
				},
				{
					id: "day_9",
					kanji: "九日",
					arabic: "9日",
					reading: "ここのか",
					romaji: ["kokonoka"]
				},
				{
					id: "day_10",
					kanji: "十日",
					arabic: "10日",
					reading: "とおか",
					romaji: ["tooka", "touka"]
				}
			],
			[
				{
					id: "day_14",
					kanji: "十四日",
					arabic: "14日",
					reading: "じゅうよっか",
					romaji: ["juuyokka", "juyokka"]
				},
				{
					id: "day_20",
					kanji: "二十日",
					arabic: "20日",
					reading: "はつか",
					romaji: ["hatsuka"]
				},
				{
					id: "day_24",
					kanji: "二十四日",
					arabic: "24日",
					reading: "にじゅうよっか",
					romaji: ["nijuuyokka", "nijuyokka"]
				},
				{
					id: "day_howmany",
					kanji: "何日",
					arabic: "何日",
					reading: "なんにち",
					romaji: ["nannichi"]
				}
			]
		]
	}
]

// Map from kanji or arabic string to answers
export const numberAnswersMap = new Map<string, string[]>()

// Populate map for fast O(1) lookup
for (const cat of numberCategories) {
	for (const row of cat.rows) {
		for (const def of row) {
			numberAnswersMap.set(def.kanji, def.romaji)
			numberAnswersMap.set(def.arabic, def.romaji)
			// Also support reading in hiragana as key
			numberAnswersMap.set(def.reading, def.romaji)
		}
	}
}

// Flat list of all number definitions
export const allNumberDefinitions: NumberDefinition[] =
	numberCategories.flatMap((c) => c.rows.flat())

// Map from ID to definition
export const numberDefinitionById = new Map<string, NumberDefinition>(
	allNumberDefinitions.map((d) => [d.id, d])
)
