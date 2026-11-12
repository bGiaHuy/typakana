import { toHiragana } from "wanakana"

export interface VocabItem {
	id: string
	lessonId: string
	subLessonId: string
	japanese: string // e.g. "私（わたし）"
	display: string // clean display for card e.g. "私 (わたし)" or "アメリカ"
	kana: string // pure kana e.g. "わたし"
	romaji: string[] // e.g. ["watashi"]
	vietnamese: string // primary meaning e.g. "Tôi"
	vietnameseAnswers: string[] // acceptable Vietnamese answers
}

export interface SubLesson {
	id: string
	lessonId: string
	title: string
	description: string
	items: VocabItem[]
}

export interface Lesson {
	id: string
	title: string
	description: string
	subLessons: SubLesson[]
}

export function removeVietnameseTones(str: string): string {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.trim()
}

// Generate base answer list including accented and unaccented, plus synonyms
function vAns(primary: string, extra: string[] = []): string[] {
	const set = new Set<string>()
	const all = [primary, ...extra]
	for (const item of all) {
		const lower = item.toLowerCase().trim()
		set.add(lower)
		set.add(removeVietnameseTones(lower))
		// If contains slashes like "thầy/cô giáo", split
		if (item.includes("/")) {
			const parts = item.split("/")
			for (const p of parts) {
				const plower = p.toLowerCase().trim()
				set.add(plower)
				set.add(removeVietnameseTones(plower))
			}
		}
		// If contains commas like "học sinh, sinh viên", split
		if (item.includes(",")) {
			const parts = item.split(",")
			for (const p of parts) {
				const plower = p.toLowerCase().trim()
				set.add(plower)
				set.add(removeVietnameseTones(plower))
			}
		}
	}
	return Array.from(set).filter(Boolean)
}

function romajiVariants(primary: string, extra: string[] = []): string[] {
	const set = new Set<string>()
	const all = [primary, ...extra]
	for (const r of all) {
		const lower = r.toLowerCase().trim().replace(/~/g, "").replace(/\\~/g, "")
		set.add(lower)
		// Long vowel replacements (ō -> ou / oo / o, ū -> uu / u)
		const oRepl = lower.replace(/ō/g, "ou")
		set.add(oRepl)
		set.add(lower.replace(/ō/g, "oo"))
		set.add(lower.replace(/ō/g, "o"))
		const uRepl = lower.replace(/ū/g, "uu")
		set.add(uRepl)
		set.add(lower.replace(/ū/g, "u"))
	}
	return Array.from(set).filter(Boolean)
}

export const lessonsData: Lesson[] = [
	{
		id: "1",
		title: "Bài 1",
		description: "Giới thiệu bản thân, địa điểm và sở thích",
		subLessons: [
			{
				id: "1.1",
				lessonId: "1",
				title: "1.1. Tên, quốc gia, nghề nghiệp",
				description: "私の名前・国・仕事",
				items: [
					{
						id: "b1_1_watashi",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "私（わたし）",
						display: "私 (わたし)",
						kana: "わたし",
						romaji: romajiVariants("watashi"),
						vietnamese: "Tôi",
						vietnameseAnswers: vAns("Tôi", ["tôi", "tớ", "mình"])
					},
					{
						id: "b1_1_namae",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "名前（なまえ）",
						display: "名前 (なまえ)",
						kana: "なまえ",
						romaji: romajiVariants("namae"),
						vietnamese: "Tên",
						vietnameseAnswers: vAns("Tên", ["họ tên"])
					},
					{
						id: "b1_1_kuni",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "国（くに）",
						display: "国 (くに)",
						kana: "くに",
						romaji: romajiVariants("kuni"),
						vietnamese: "Đất nước",
						vietnameseAnswers: vAns("Đất nước", ["nước", "quốc gia"])
					},
					{
						id: "b1_1_nihon",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "日本（にほん）",
						display: "日本 (にほん)",
						kana: "にほん",
						romaji: romajiVariants("nihon", ["nippon"]),
						vietnamese: "Nhật Bản",
						vietnameseAnswers: vAns("Nhật Bản", ["nước nhật", "nhật"])
					},
					{
						id: "b1_1_amerika",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "アメリカ",
						display: "アメリカ",
						kana: "アメリカ",
						romaji: romajiVariants("amerika"),
						vietnamese: "Mỹ",
						vietnameseAnswers: vAns("Mỹ", ["nước mỹ", "hoa kỳ"])
					},
					{
						id: "b1_1_itaria",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "イタリア",
						display: "イタリア",
						kana: "イタリア",
						romaji: romajiVariants("itaria"),
						vietnamese: "Ý",
						vietnameseAnswers: vAns("Ý", ["nước ý", "italia"])
					},
					{
						id: "b1_1_osutoraria",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "オーストラリア",
						display: "オーストラリア",
						kana: "オーストラリア",
						romaji: romajiVariants("ōsutoraria", ["oosutoraria", "osutoraria"]),
						vietnamese: "Úc",
						vietnameseAnswers: vAns("Úc", ["nước úc", "australia"])
					},
					{
						id: "b1_1_kankoku",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "韓国（かんこく）",
						display: "韓国 (かんこく)",
						kana: "かんこく",
						romaji: romajiVariants("kankoku"),
						vietnamese: "Hàn Quốc",
						vietnameseAnswers: vAns("Hàn Quốc", ["nước hàn"])
					},
					{
						id: "b1_1_tai",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "タイ",
						display: "タイ",
						kana: "タイ",
						romaji: romajiVariants("tai"),
						vietnamese: "Thái Lan",
						vietnameseAnswers: vAns("Thái Lan", ["thái"])
					},
					{
						id: "b1_1_chugoku",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "中国（ちゅうごく）",
						display: "中国 (ちゅうごく)",
						kana: "ちゅうごく",
						romaji: romajiVariants("chūgoku", ["chuugoku", "chugoku"]),
						vietnamese: "Trung Quốc",
						vietnameseAnswers: vAns("Trung Quốc", ["nước trung quốc"])
					},
					{
						id: "b1_1_roshia",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "ロシア",
						display: "ロシア",
						kana: "ロシア",
						romaji: romajiVariants("roshia"),
						vietnamese: "Nga",
						vietnameseAnswers: vAns("Nga", ["nước nga"])
					},
					{
						id: "b1_1_koko",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "高校（こうこう）",
						display: "高校 (こうこう)",
						kana: "こうこう",
						romaji: romajiVariants("kōkō", ["koukou", "koko"]),
						vietnamese: "Trường THPT",
						vietnameseAnswers: vAns("Trường THPT", [
							"thpt",
							"cấp 3",
							"trường cấp 3"
						])
					},
					{
						id: "b1_1_daigaku",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "大学（だいがく）",
						display: "大学 (だいがく)",
						kana: "だいがく",
						romaji: romajiVariants("daigaku"),
						vietnamese: "Đại học",
						vietnameseAnswers: vAns("Đại học", ["trường đại học"])
					},
					{
						id: "b1_1_nihongo_gakko",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "日本語学校（にほんごがっこう）",
						display: "日本語学校 (にほんごがっこう)",
						kana: "にほんごがっこう",
						romaji: romajiVariants("nihongo gakkō", [
							"nihongo gakkou",
							"nihongogakkou"
						]),
						vietnamese: "Trường tiếng Nhật",
						vietnameseAnswers: vAns("Trường tiếng Nhật")
					},
					{
						id: "b1_1_shigoto",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "仕事（しごと）",
						display: "仕事 (しごと)",
						kana: "しごと",
						romaji: romajiVariants("shigoto"),
						vietnamese: "Công việc",
						vietnameseAnswers: vAns("Công việc", ["việc làm"])
					},
					{
						id: "b1_1_gakusei",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "学生（がくせい）",
						display: "学生 (がくせい)",
						kana: "がくせい",
						romaji: romajiVariants("gakusei"),
						vietnamese: "Học sinh, sinh viên",
						vietnameseAnswers: vAns("Học sinh, sinh viên", [
							"học sinh",
							"sinh viên"
						])
					},
					{
						id: "b1_1_sensei",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "先生（せんせい）",
						display: "先生 (せんせい)",
						kana: "せんせい",
						romaji: romajiVariants("sensei"),
						vietnamese: "Thầy/cô giáo",
						vietnameseAnswers: vAns("Thầy/cô giáo", [
							"thầy giáo",
							"cô giáo",
							"giáo viên",
							"thầy cô"
						])
					},
					{
						id: "b1_1_kyoshi",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "教師（きょうし）",
						display: "教師 (きょうし)",
						kana: "きょうし",
						romaji: romajiVariants("kyōshi", ["kyoushi", "kyoshi"]),
						vietnamese: "Giáo viên",
						vietnameseAnswers: vAns("Giáo viên")
					},
					{
						id: "b1_1_kaishain",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "会社員（かいしゃいん）",
						display: "会社員 (かいしゃいん)",
						kana: "かいしゃいん",
						romaji: romajiVariants("kaishain"),
						vietnamese: "Nhân viên công ty",
						vietnameseAnswers: vAns("Nhân viên công ty")
					},
					{
						id: "b1_1_shain",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "社員（しゃいん）",
						display: "社員 (しゃいん)",
						kana: "しゃいん",
						romaji: romajiVariants("shain"),
						vietnamese: "Nhân viên",
						vietnameseAnswers: vAns("Nhân viên")
					},
					{
						id: "b1_1_san",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "～さん",
						display: "～さん",
						kana: "さん",
						romaji: romajiVariants("san", ["~san"]),
						vietnamese: "Anh/chị/bạn/ông/bà",
						vietnameseAnswers: vAns("Anh/chị/bạn/ông/bà", [
							"anh",
							"chị",
							"bạn",
							"ông",
							"bà"
						])
					},
					{
						id: "b1_1_jin",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "～人（じん）",
						display: "～人 (じん)",
						kana: "じん",
						romaji: romajiVariants("jin", ["~jin"]),
						vietnamese: "Người nước ~",
						vietnameseAnswers: vAns("Người nước ~", ["người nước", "người"])
					},
					{
						id: "b1_1_dochira",
						lessonId: "1",
						subLessonId: "1.1",
						japanese: "どちら",
						display: "どちら",
						kana: "どちら",
						romaji: romajiVariants("dochira"),
						vietnamese: "Phía nào, ở đâu (lịch sự)",
						vietnameseAnswers: vAns("Phía nào, ở đâu", [
							"phía nào",
							"ở đâu",
							"hướng nào",
							"đâu"
						])
					}
				]
			},
			{
				id: "1.2",
				lessonId: "1",
				title: "1.2. Sinh nhật",
				description: "私の誕生日",
				items: [
					{
						id: "b1_2_tanjobi",
						lessonId: "1",
						subLessonId: "1.2",
						japanese: "誕生日（たんじょうび）",
						display: "誕生日 (たんじょうび)",
						kana: "たんじょうび",
						romaji: romajiVariants("tanjōbi", ["tanjoubi", "tanjobi"]),
						vietnamese: "Sinh nhật",
						vietnameseAnswers: vAns("Sinh nhật", [
							"ngày sinh nhật",
							"ngày sinh"
						])
					},
					{
						id: "b1_2_burajiru",
						lessonId: "1",
						subLessonId: "1.2",
						japanese: "ブラジル",
						display: "ブラジル",
						kana: "ブラジル",
						romaji: romajiVariants("burajiru"),
						vietnamese: "Brazil",
						vietnameseAnswers: vAns("Brazil", ["nước brazil", "bra-xin"])
					},
					{
						id: "b1_2_gatsu",
						lessonId: "1",
						subLessonId: "1.2",
						japanese: "～月（がつ）",
						display: "～月 (がつ)",
						kana: "がつ",
						romaji: romajiVariants("gatsu", ["~gatsu"]),
						vietnamese: "Tháng ~",
						vietnameseAnswers: vAns("Tháng ~", ["tháng"])
					},
					{
						id: "b1_2_nichi",
						lessonId: "1",
						subLessonId: "1.2",
						japanese: "～日（にち／か）",
						display: "～日 (にち／か)",
						kana: "にち",
						romaji: romajiVariants("nichi", ["ka", "~nichi", "~ka"]),
						vietnamese: "Ngày ~",
						vietnameseAnswers: vAns("Ngày ~", ["ngày"])
					},
					{
						id: "b1_2_sai",
						lessonId: "1",
						subLessonId: "1.2",
						japanese: "～歳（さい）",
						display: "～歳 (さい)",
						kana: "さい",
						romaji: romajiVariants("sai", ["~sai"]),
						vietnamese: "~ tuổi",
						vietnameseAnswers: vAns("~ tuổi", ["tuổi"])
					},
					{
						id: "b1_2_itsu",
						lessonId: "1",
						subLessonId: "1.2",
						japanese: "いつ",
						display: "いつ",
						kana: "いつ",
						romaji: romajiVariants("itsu"),
						vietnamese: "Khi nào",
						vietnameseAnswers: vAns("Khi nào", ["bao giờ"])
					}
				]
			},
			{
				id: "1.3",
				lessonId: "1",
				title: "1.3. Sở thích",
				description: "私の趣味",
				items: [
					{
						id: "b1_3_shumi",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "趣味（しゅみ）",
						display: "趣味 (しゅみ)",
						kana: "しゅみ",
						romaji: romajiVariants("shumi"),
						vietnamese: "Sở thích",
						vietnameseAnswers: vAns("Sở thích")
					},
					{
						id: "b1_3_supotsu",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "スポーツ",
						display: "スポーツ",
						kana: "スポーツ",
						romaji: romajiVariants("supōtsu", ["supootsu", "supotsu"]),
						vietnamese: "Thể thao",
						vietnameseAnswers: vAns("Thể thao")
					},
					{
						id: "b1_3_sakka",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "サッカー",
						display: "サッカー",
						kana: "サッカー",
						romaji: romajiVariants("sakkā", ["sakkaa", "sakka"]),
						vietnamese: "Bóng đá",
						vietnameseAnswers: vAns("Bóng đá")
					},
					{
						id: "b1_3_tenisu",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "テニス",
						display: "テニス",
						kana: "テニス",
						romaji: romajiVariants("tenisu"),
						vietnamese: "Tennis",
						vietnameseAnswers: vAns("Tennis", ["quần vợt"])
					},
					{
						id: "b1_3_suiei",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "水泳（すいえい）",
						display: "水泳 (すいえい)",
						kana: "すいえい",
						romaji: romajiVariants("suiei"),
						vietnamese: "Bơi lội",
						vietnameseAnswers: vAns("Bơi lội", ["bơi"])
					},
					{
						id: "b1_3_eiga",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "映画（えいが）",
						display: "映画 (えいが)",
						kana: "えいが",
						romaji: romajiVariants("eiga"),
						vietnamese: "Phim ảnh",
						vietnameseAnswers: vAns("Phim ảnh", ["phim", "điện ảnh"])
					},
					{
						id: "b1_3_ongaku",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "音楽（おんがく）",
						display: "音楽 (おんがく)",
						kana: "おんがく",
						romaji: romajiVariants("ongaku"),
						vietnamese: "Âm nhạc",
						vietnameseAnswers: vAns("Âm nhạc", ["nhạc"])
					},
					{
						id: "b1_3_dokusho",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "読書（どくしょ）",
						display: "読書 (どくしょ)",
						kana: "どくしょ",
						romaji: romajiVariants("dokusho"),
						vietnamese: "Đọc sách",
						vietnameseAnswers: vAns("Đọc sách")
					},
					{
						id: "b1_3_ryoko",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "旅行（りょこう）",
						display: "旅行 (りょこう)",
						kana: "りょこう",
						romaji: romajiVariants("ryokō", ["ryokou", "ryoko"]),
						vietnamese: "Du lịch",
						vietnameseAnswers: vAns("Du lịch")
					},
					{
						id: "b1_3_ryori",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "料理（りょうり）",
						display: "料理 (りょうり)",
						kana: "りょうり",
						romaji: romajiVariants("ryōri", ["ryouri", "ryori"]),
						vietnamese: "Nấu ăn, món ăn",
						vietnameseAnswers: vAns("Nấu ăn, món ăn", ["nấu ăn", "món ăn"])
					},
					{
						id: "b1_3_nan",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "何（なん）",
						display: "何 (なん)",
						kana: "なん",
						romaji: romajiVariants("nan", ["nani"]),
						vietnamese: "Cái gì",
						vietnameseAnswers: vAns("Cái gì", ["gì"])
					},
					{
						id: "b1_3_a",
						lessonId: "1",
						subLessonId: "1.3",
						japanese: "あっ",
						display: "あっ",
						kana: "あっ",
						romaji: romajiVariants("a", ["a!"]),
						vietnamese: "À!",
						vietnameseAnswers: vAns("À!", ["à", "a!"])
					}
				]
			},
			{
				id: "1.4",
				lessonId: "1",
				title: "1.4. Mẫu câu giao tiếp Bài 1",
				description: "Các mẫu câu giao tiếp",
				items: [
					{
						id: "b1_4_hajimemashite",
						lessonId: "1",
						subLessonId: "1.4",
						japanese: "はじめまして",
						display: "はじめまして",
						kana: "はじめまして",
						romaji: romajiVariants("hajimemashite"),
						vietnamese: "Rất vui được gặp bạn",
						vietnameseAnswers: vAns("Rất vui được gặp bạn", [
							"chào bạn lần đầu",
							"hân hạnh được gặp"
						])
					},
					{
						id: "b1_4_yoroshiku",
						lessonId: "1",
						subLessonId: "1.4",
						japanese: "よろしくお願いします",
						display: "よろしくお願いします",
						kana: "よろしくおねがいします",
						romaji: romajiVariants("yoroshiku onegaishimasu"),
						vietnamese: "Rất mong được giúp đỡ",
						vietnameseAnswers: vAns("Rất mong được giúp đỡ", [
							"mong được giúp đỡ",
							"nhờ bạn giúp đỡ"
						])
					},
					{
						id: "b1_4_kochirakoso",
						lessonId: "1",
						subLessonId: "1.4",
						japanese: "こちらこそ",
						display: "こちらこそ",
						kana: "こちらこそ",
						romaji: romajiVariants("kochira koso"),
						vietnamese: "Tôi cũng vậy",
						vietnameseAnswers: vAns("Tôi cũng vậy", [
							"chính tôi mới là người cần giúp đỡ",
							"tôi cũng thế"
						])
					},
					{
						id: "b1_4_ano",
						lessonId: "1",
						subLessonId: "1.4",
						japanese: "あのう",
						display: "あのう",
						kana: "あのう",
						romaji: romajiVariants("anō", ["anou", "ano"]),
						vietnamese: "À, ừm...",
						vietnameseAnswers: vAns("À, ừm...", ["à", "ừm", "xin lỗi cho hỏi"])
					},
					{
						id: "b1_4_sumimasen",
						lessonId: "1",
						subLessonId: "1.4",
						japanese: "すみません",
						display: "すみません",
						kana: "すみません",
						romaji: romajiVariants("sumimasen"),
						vietnamese: "Xin lỗi",
						vietnameseAnswers: vAns("Xin lỗi", ["xin lỗi làm phiền"])
					},
					{
						id: "b1_4_sodesuka",
						lessonId: "1",
						subLessonId: "1.4",
						japanese: "そうですか",
						display: "そうですか",
						kana: "そうですか",
						romaji: romajiVariants("sō desu ka", ["sou desu ka", "so desu ka"]),
						vietnamese: "Thế à!",
						vietnameseAnswers: vAns("Thế à!", ["thế à", "vậy à", "ra là vậy"])
					},
					{
						id: "b1_4_hai",
						lessonId: "1",
						subLessonId: "1.4",
						japanese: "はい",
						display: "はい",
						kana: "はい",
						romaji: romajiVariants("hai"),
						vietnamese: "Vâng",
						vietnameseAnswers: vAns("Vâng", ["đúng", "có", "dạ"])
					},
					{
						id: "b1_4_iie",
						lessonId: "1",
						subLessonId: "1.4",
						japanese: "いいえ",
						display: "いいえ",
						kana: "いいえ",
						romaji: romajiVariants("iie"),
						vietnamese: "Không",
						vietnameseAnswers: vAns("Không", ["không phải"])
					}
				]
			}
		]
	},
	{
		id: "2",
		title: "Bài 2",
		description: "Địa điểm, mua sắm và nhà hàng",
		subLessons: [
			{
				id: "2.1",
				lessonId: "2",
				title: "2.1. Địa điểm và đồ vật",
				description: "どこですか",
				items: [
					{
						id: "b2_1_koko",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "ここ / こちら",
						display: "ここ / こちら",
						kana: "ここ",
						romaji: romajiVariants("koko", ["kochira"]),
						vietnamese: "Đây, phía này",
						vietnameseAnswers: vAns("Đây, phía này", [
							"đây",
							"phía này",
							"ở đây"
						])
					},
					{
						id: "b2_1_soko",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "そこ / そちら",
						display: "そこ / そちら",
						kana: "そこ",
						romaji: romajiVariants("soko", ["sochira"]),
						vietnamese: "Đó, phía đó",
						vietnameseAnswers: vAns("Đó, phía đó", ["đó", "phía đó", "ở đó"])
					},
					{
						id: "b2_1_asoko",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "あそこ / あちら",
						display: "あそこ / あちら",
						kana: "あそこ",
						romaji: romajiVariants("asoko", ["achira"]),
						vietnamese: "Kia, phía kia",
						vietnameseAnswers: vAns("Kia, phía kia", [
							"kia",
							"phía kia",
							"ở kia"
						])
					},
					{
						id: "b2_1_infomeshon",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "インフォメーション",
						display: "インフォメーション",
						kana: "インフォメーション",
						romaji: romajiVariants("infomēshon", ["infomeeshon", "infomeshon"]),
						vietnamese: "Quầy thông tin",
						vietnameseAnswers: vAns("Quầy thông tin", ["thông tin"])
					},
					{
						id: "b2_1_atm",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "ATM",
						display: "ATM",
						kana: "エーティーエム",
						romaji: romajiVariants("ē tī emu", ["atm", "eetiiemu"]),
						vietnamese: "Máy ATM",
						vietnameseAnswers: vAns("Máy ATM", ["atm", "cây atm"])
					},
					{
						id: "b2_1_esukareta",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "エスカレーター",
						display: "エスカレーター",
						kana: "エスカレーター",
						romaji: romajiVariants("esukarētā", ["esukareetaa", "esukareta"]),
						vietnamese: "Thang cuốn",
						vietnameseAnswers: vAns("Thang cuốn")
					},
					{
						id: "b2_1_erebeta",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "エレベーター",
						display: "エレベーター",
						kana: "エレベーター",
						romaji: romajiVariants("erebētā", ["erebeetaa", "erebeta"]),
						vietnamese: "Thang máy",
						vietnameseAnswers: vAns("Thang máy")
					},
					{
						id: "b2_1_kitsuenjo",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "喫煙所（きつえんじょ）",
						display: "喫煙所 (きつえんじょ)",
						kana: "きつえんじょ",
						romaji: romajiVariants("kitsuenjo"),
						vietnamese: "Nơi hút thuốc",
						vietnameseAnswers: vAns("Nơi hút thuốc", [
							"phòng hút thuốc",
							"chỗ hút thuốc"
						])
					},
					{
						id: "b2_1_toire",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "トイレ",
						display: "トイレ",
						kana: "トイレ",
						romaji: romajiVariants("toire"),
						vietnamese: "Nhà vệ sinh",
						vietnameseAnswers: vAns("Nhà vệ sinh", ["toilet", "vệ sinh"])
					},
					{
						id: "b2_1_reji",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "レジ",
						display: "レジ",
						kana: "レジ",
						romaji: romajiVariants("reji"),
						vietnamese: "Quầy thanh toán",
						vietnameseAnswers: vAns("Quầy thanh toán", [
							"quầy thu ngân",
							"thu ngân"
						])
					},
					{
						id: "b2_1_kissaten",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "喫茶店（きっさてん）",
						display: "喫茶店 (きっさてん)",
						kana: "きっさてん",
						romaji: romajiVariants("kissaten"),
						vietnamese: "Quán giải khát",
						vietnameseAnswers: vAns("Quán giải khát", [
							"quán cà phê",
							"quán trà"
						])
					},
					{
						id: "b2_1_supa",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "スーパー",
						display: "スーパー",
						kana: "スーパー",
						romaji: romajiVariants("sūpā", ["suupaa", "supa"]),
						vietnamese: "Siêu thị",
						vietnameseAnswers: vAns("Siêu thị")
					},
					{
						id: "b2_1_hyakuen",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "100円ショップ",
						display: "100円ショップ",
						kana: "ひゃくえんショップ",
						romaji: romajiVariants("hyaku en shoppu", ["hyakuenshoppu"]),
						vietnamese: "Cửa hàng 100 yên",
						vietnameseAnswers: vAns("Cửa hàng 100 yên", ["tiệm 100 yên"])
					},
					{
						id: "b2_1_resutoran",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "レストラン",
						display: "レストラン",
						kana: "レストラン",
						romaji: romajiVariants("resutoran"),
						vietnamese: "Nhà hàng",
						vietnameseAnswers: vAns("Nhà hàng", ["quán ăn"])
					},
					{
						id: "b2_1_chika",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "地下（ちか）",
						display: "地下 (ちか)",
						kana: "ちか",
						romaji: romajiVariants("chika"),
						vietnamese: "Tầng hầm, dưới đất",
						vietnameseAnswers: vAns("Tầng hầm, dưới đất", [
							"tầng hầm",
							"dưới đất"
						])
					},
					{
						id: "b2_1_kamera",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "カメラ",
						display: "カメラ",
						kana: "カメラ",
						romaji: romajiVariants("kamera"),
						vietnamese: "Máy ảnh",
						vietnameseAnswers: vAns("Máy ảnh")
					},
					{
						id: "b2_1_keitai",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "携帯電話（けいたいでんわ）",
						display: "携帯電話 (けいたいでんわ)",
						kana: "けいたいでんわ",
						romaji: romajiVariants("keitai denwa", ["keitaidenwa", "keitai"]),
						vietnamese: "Điện thoại di động",
						vietnameseAnswers: vAns("Điện thoại di động", ["điện thoại"])
					},
					{
						id: "b2_1_denshijisho",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "電子辞書（でんしじしょ）",
						display: "電子辞書 (でんしじしょ)",
						kana: "でんしじしょ",
						romaji: romajiVariants("denshi jisho", ["denshijisho"]),
						vietnamese: "Kim từ điển",
						vietnameseAnswers: vAns("Kim từ điển", ["từ điển điện tử"])
					},
					{
						id: "b2_1_pasokon",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "パソコン",
						display: "パソコン",
						kana: "パソコン",
						romaji: romajiVariants("pasokon"),
						vietnamese: "Máy tính cá nhân",
						vietnameseAnswers: vAns("Máy tính cá nhân", ["máy tính", "laptop"])
					},
					{
						id: "b2_1_kutsu",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "くつ",
						display: "くつ",
						kana: "くつ",
						romaji: romajiVariants("kutsu"),
						vietnamese: "Giày",
						vietnameseAnswers: vAns("Giày", ["đôi giày"])
					},
					{
						id: "b2_1_keshigomu",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "消しゴム（けしゴム）",
						display: "消しゴム (けしゴム)",
						kana: "けしゴム",
						romaji: romajiVariants("keshigomu"),
						vietnamese: "Tẩy",
						vietnameseAnswers: vAns("Tẩy", ["cục tẩy", "gôm"])
					},
					{
						id: "b2_1_pen",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "ペン",
						display: "ペン",
						kana: "ペン",
						romaji: romajiVariants("pen"),
						vietnamese: "Bút",
						vietnameseAnswers: vAns("Bút", ["cây bút", "bút mực"])
					},
					{
						id: "b2_1_toirettopepa",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "トイレットペーパー",
						display: "トイレットペーパー",
						kana: "トイレットペーパー",
						romaji: romajiVariants("toiretto pēpā", [
							"toirettopeepaa",
							"toirettopepa"
						]),
						vietnamese: "Giấy vệ sinh",
						vietnameseAnswers: vAns("Giấy vệ sinh", ["cuộn giấy vệ sinh"])
					},
					{
						id: "b2_1_hon",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "本（ほん）",
						display: "本 (ほん)",
						kana: "ほん",
						romaji: romajiVariants("hon"),
						vietnamese: "Sách",
						vietnameseAnswers: vAns("Sách", ["quyển sách"])
					},
					{
						id: "b2_1_abura",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "油（あぶら）",
						display: "油 (あぶら)",
						kana: "あぶら",
						romaji: romajiVariants("abura"),
						vietnamese: "Dầu",
						vietnameseAnswers: vAns("Dầu", ["dầu ăn"])
					},
					{
						id: "b2_1_keki",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "ケーキ",
						display: "ケーキ",
						kana: "ケーキ",
						romaji: romajiVariants("kēki", ["keeki", "keki"]),
						vietnamese: "Bánh ngọt",
						vietnameseAnswers: vAns("Bánh ngọt", ["bánh kem", "bánh"])
					},
					{
						id: "b2_1_kome",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "米（こめ）",
						display: "米 (こめ)",
						kana: "こめ",
						romaji: romajiVariants("kome"),
						vietnamese: "Gạo",
						vietnameseAnswers: vAns("Gạo")
					},
					{
						id: "b2_1_tamago",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "卵（たまご）",
						display: "卵 (たまご)",
						kana: "たまご",
						romaji: romajiVariants("tamago"),
						vietnamese: "Trứng",
						vietnameseAnswers: vAns("Trứng", ["quả trứng"])
					},
					{
						id: "b2_1_pan",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "パン",
						display: "パン",
						kana: "パン",
						romaji: romajiVariants("pan"),
						vietnamese: "Bánh mì",
						vietnameseAnswers: vAns("Bánh mì")
					},
					{
						id: "b2_1_mizu",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "水（みず）",
						display: "水 (みず)",
						kana: "みず",
						romaji: romajiVariants("mizu"),
						vietnamese: "Nước",
						vietnameseAnswers: vAns("Nước", ["nước lọc"])
					},
					{
						id: "b2_1_tenin",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "店員（てんいん）",
						display: "店員 (てんいん)",
						kana: "てんいん",
						romaji: romajiVariants("ten'in", ["tenin"]),
						vietnamese: "Nhân viên bán hàng",
						vietnameseAnswers: vAns("Nhân viên bán hàng", ["nhân viên tiệm"])
					},
					{
						id: "b2_1_kai",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "～階（かい）",
						display: "～階 (かい)",
						kana: "かい",
						romaji: romajiVariants("kai", ["~kai"]),
						vietnamese: "Tầng ~",
						vietnameseAnswers: vAns("Tầng ~", ["tầng"])
					},
					{
						id: "b2_1_ya",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "～屋（や）",
						display: "～屋 (や)",
						kana: "や",
						romaji: romajiVariants("ya", ["~ya"]),
						vietnamese: "Cửa hàng ~",
						vietnameseAnswers: vAns("Cửa hàng ~", ["tiệm", "quán"])
					},
					{
						id: "b2_1_doko",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "どこ",
						display: "どこ",
						kana: "どこ",
						romaji: romajiVariants("doko"),
						vietnamese: "Ở đâu",
						vietnameseAnswers: vAns("Ở đâu", ["đâu"])
					},
					{
						id: "b2_1_irasshaimase",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "いらっしゃいませ",
						display: "いらっしゃいませ",
						kana: "いらっしゃいませ",
						romaji: romajiVariants("irasshaimase"),
						vietnamese: "Kính chào quý khách",
						vietnameseAnswers: vAns("Kính chào quý khách", [
							"chào mừng quý khách"
						])
					},
					{
						id: "b2_1_arigato",
						lessonId: "2",
						subLessonId: "2.1",
						japanese: "ありがとうございます",
						display: "ありがとうございます",
						kana: "ありがとうございます",
						romaji: romajiVariants("arigatō gozaimasu", [
							"arigatou gozaimasu",
							"arigato gozaimasu"
						]),
						vietnamese: "Xin cảm ơn",
						vietnameseAnswers: vAns("Xin cảm ơn", ["cảm ơn"])
					}
				]
			},
			{
				id: "2.2",
				lessonId: "2",
				title: "2.2. Giá tiền và mua sắm",
				description: "いくらですか",
				items: [
					{
						id: "b2_2_kore",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "これ",
						display: "これ",
						kana: "これ",
						romaji: romajiVariants("kore"),
						vietnamese: "Cái này",
						vietnameseAnswers: vAns("Cái này", ["đây"])
					},
					{
						id: "b2_2_sore",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "それ",
						display: "それ",
						kana: "それ",
						romaji: romajiVariants("sore"),
						vietnamese: "Cái đó",
						vietnameseAnswers: vAns("Cái đó", ["đó"])
					},
					{
						id: "b2_2_are",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "あれ",
						display: "あれ",
						kana: "あれ",
						romaji: romajiVariants("are"),
						vietnamese: "Cái kia",
						vietnameseAnswers: vAns("Cái kia", ["kia"])
					},
					{
						id: "b2_2_kono",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "この～",
						display: "この～",
						kana: "この",
						romaji: romajiVariants("kono", ["kono ~"]),
						vietnamese: "Cái ~ này",
						vietnameseAnswers: vAns("Cái ~ này", ["này", "cái này"])
					},
					{
						id: "b2_2_sono",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "その～",
						display: "その～",
						kana: "その",
						romaji: romajiVariants("sono", ["sono ~"]),
						vietnamese: "Cái ~ đó",
						vietnameseAnswers: vAns("Cái ~ đó", ["đó", "cái đó"])
					},
					{
						id: "b2_2_ano",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "あの～",
						display: "あの～",
						kana: "あの",
						romaji: romajiVariants("ano", ["ano ~"]),
						vietnamese: "Cái ~ kia",
						vietnameseAnswers: vAns("Cái ~ kia", ["kia", "cái kia"])
					},
					{
						id: "b2_2_kaban",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "かばん",
						display: "かばん",
						kana: "かばん",
						romaji: romajiVariants("kaban"),
						vietnamese: "Cặp, túi xách",
						vietnameseAnswers: vAns("Cặp, túi xách", ["cặp", "túi xách", "túi"])
					},
					{
						id: "b2_2_zubon",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "ズボン",
						display: "ズボン",
						kana: "ズボン",
						romaji: romajiVariants("zubon"),
						vietnamese: "Quần dài",
						vietnameseAnswers: vAns("Quần dài", ["quần"])
					},
					{
						id: "b2_2_tshatsu",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "Tシャツ",
						display: "Tシャツ",
						kana: "ティーシャツ",
						romaji: romajiVariants("tī shatsu", ["tiishatsu", "tshatsu"]),
						vietnamese: "Áo phông",
						vietnameseAnswers: vAns("Áo phông", ["áo thun"])
					},
					{
						id: "b2_2_tokei",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "時計（とけい）",
						display: "時計 (とけい)",
						kana: "とけい",
						romaji: romajiVariants("tokei"),
						vietnamese: "Đồng hồ",
						vietnameseAnswers: vAns("Đồng hồ")
					},
					{
						id: "b2_2_en",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "～円（えん）",
						display: "～円 (えん)",
						kana: "えん",
						romaji: romajiVariants("en", ["~en"]),
						vietnamese: "~ yên",
						vietnameseAnswers: vAns("~ yên", ["yên"])
					},
					{
						id: "b2_2_ikura",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "いくら",
						display: "いくら",
						kana: "いくら",
						romaji: romajiVariants("ikura"),
						vietnamese: "Bao nhiêu tiền",
						vietnameseAnswers: vAns("Bao nhiêu tiền", [
							"bao nhiêu",
							"giá bao nhiêu"
						])
					},
					{
						id: "b2_2_ja",
						lessonId: "2",
						subLessonId: "2.2",
						japanese: "じゃ",
						display: "じゃ",
						kana: "じゃ",
						romaji: romajiVariants("ja", ["jya"]),
						vietnamese: "Thế thì, vậy thì",
						vietnameseAnswers: vAns("Thế thì, vậy thì", [
							"thế thì",
							"vậy thì",
							"vậy"
						])
					}
				]
			},
			{
				id: "2.3",
				lessonId: "2",
				title: "2.3. Nhà hàng, thực phẩm",
				description: "レストラン",
				items: [
					{
						id: "b2_3_sakana",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "魚（さかな）",
						display: "魚 (さかな)",
						kana: "さかな",
						romaji: romajiVariants("sakana"),
						vietnamese: "Cá",
						vietnameseAnswers: vAns("Cá", ["con cá"])
					},
					{
						id: "b2_3_niku",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "肉（にく）",
						display: "肉 (にく)",
						kana: "にく",
						romaji: romajiVariants("niku"),
						vietnamese: "Thịt",
						vietnameseAnswers: vAns("Thịt")
					},
					{
						id: "b2_3_gyuniku",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "牛肉（ぎゅうにく）",
						display: "牛肉 (ぎゅうにく)",
						kana: "ぎゅうにく",
						romaji: romajiVariants("gyūniku", ["gyuuniku", "gyuniku"]),
						vietnamese: "Thịt bò",
						vietnameseAnswers: vAns("Thịt bò")
					},
					{
						id: "b2_3_toriniku",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "鶏肉（とりにく）",
						display: "鶏肉 (とりにく)",
						kana: "とりにく",
						romaji: romajiVariants("toriniku"),
						vietnamese: "Thịt gà",
						vietnameseAnswers: vAns("Thịt gà")
					},
					{
						id: "b2_3_butaniku",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "豚肉（ぶたにく）",
						display: "豚肉 (ぶたにく)",
						kana: "ぶたにく",
						romaji: romajiVariants("butaniku"),
						vietnamese: "Thịt lợn",
						vietnameseAnswers: vAns("Thịt lợn", ["thịt heo"])
					},
					{
						id: "b2_3_yasai",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "野菜（やさい）",
						display: "野菜 (やさい)",
						kana: "やさい",
						romaji: romajiVariants("yasai"),
						vietnamese: "Rau",
						vietnameseAnswers: vAns("Rau", ["rau củ"])
					},
					{
						id: "b2_3_ichigo",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "イチゴ",
						display: "イチゴ",
						kana: "イチゴ",
						romaji: romajiVariants("ichigo"),
						vietnamese: "Dâu tây",
						vietnameseAnswers: vAns("Dâu tây", ["quả dâu", "dâu"])
					},
					{
						id: "b2_3_ringo",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "リンゴ",
						display: "リンゴ",
						kana: "リンゴ",
						romaji: romajiVariants("ringo"),
						vietnamese: "Táo",
						vietnameseAnswers: vAns("Táo", ["quả táo"])
					},
					{
						id: "b2_3_ryori",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "料理（りょうり）",
						display: "料理 (りょうり)",
						kana: "りょうり",
						romaji: romajiVariants("ryōri", ["ryouri", "ryori"]),
						vietnamese: "Món ăn, nấu ăn",
						vietnameseAnswers: vAns("Món ăn, nấu ăn", ["món ăn", "nấu ăn"])
					},
					{
						id: "b2_3_kare",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "カレー",
						display: "カレー",
						kana: "カレー",
						romaji: romajiVariants("karē", ["karee", "kare"]),
						vietnamese: "Cà ri",
						vietnameseAnswers: vAns("Cà ri", ["cơm cà ri"])
					},
					{
						id: "b2_3_supu",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "スープ",
						display: "スープ",
						kana: "スープ",
						romaji: romajiVariants("sūpu", ["suupu", "supu"]),
						vietnamese: "Súp",
						vietnameseAnswers: vAns("Súp", ["canh"])
					},
					{
						id: "b2_3_tonkatsu",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "とんかつ",
						display: "とんかつ",
						kana: "とんかつ",
						romaji: romajiVariants("tonkatsu"),
						vietnamese: "Thịt lợn chiên xù",
						vietnameseAnswers: vAns("Thịt lợn chiên xù", [
							"thịt heo chiên xù",
							"tonkatsu"
						])
					},
					{
						id: "b2_3_hanbagu",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "ハンバーグ",
						display: "ハンバーグ",
						kana: "ハンバーグ",
						romaji: romajiVariants("hanbāgu", ["hanbaagu", "hanbagu"]),
						vietnamese: "Thịt băm viên",
						vietnameseAnswers: vAns("Thịt băm viên", ["hamburg"])
					},
					{
						id: "b2_3_gohan",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "ご飯（ごはん）",
						display: "ご飯 (ごはん)",
						kana: "ごはん",
						romaji: romajiVariants("gohan"),
						vietnamese: "Cơm, bữa ăn",
						vietnameseAnswers: vAns("Cơm, bữa ăn", ["cơm", "bữa ăn"])
					},
					{
						id: "b2_3_raisu",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "ライス",
						display: "ライス",
						kana: "ライス",
						romaji: romajiVariants("raisu"),
						vietnamese: "Cơm",
						vietnameseAnswers: vAns("Cơm")
					},
					{
						id: "b2_3_jusu",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "ジュース",
						display: "ジュース",
						kana: "ジュース",
						romaji: romajiVariants("jūsu", ["juusu", "jusu"]),
						vietnamese: "Nước trái cây",
						vietnameseAnswers: vAns("Nước trái cây", [
							"nước hoa quả",
							"nước ép"
						])
					},
					{
						id: "b2_3_kohi",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "コーヒー",
						display: "コーヒー",
						kana: "コーヒー",
						romaji: romajiVariants("kōhī", ["koohii", "kohi"]),
						vietnamese: "Cà phê",
						vietnameseAnswers: vAns("Cà phê", ["cafe"])
					},
					{
						id: "b2_3_kocha",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "紅茶（こうちゃ）",
						display: "紅茶 (こうちゃ)",
						kana: "こうちゃ",
						romaji: romajiVariants("kōcha", ["koucha", "kocha"]),
						vietnamese: "Trà đen",
						vietnameseAnswers: vAns("Trà đen", ["hồng trà"])
					},
					{
						id: "b2_3_ocha",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "お茶（おちゃ）",
						display: "お茶 (おちゃ)",
						kana: "おちゃ",
						romaji: romajiVariants("ocha"),
						vietnamese: "Trà",
						vietnameseAnswers: vAns("Trà", ["nước chè", "chè"])
					},
					{
						id: "b2_3_biru",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "ビール",
						display: "ビール",
						kana: "ビール",
						romaji: romajiVariants("bīru", ["biiru", "biru"]),
						vietnamese: "Bia",
						vietnameseAnswers: vAns("Bia")
					},
					{
						id: "b2_3_wain",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "ワイン",
						display: "ワイン",
						kana: "ワイン",
						romaji: romajiVariants("wain"),
						vietnamese: "Rượu vang",
						vietnameseAnswers: vAns("Rượu vang", ["rượu"])
					},
					{
						id: "b2_3_indo",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "インド",
						display: "インド",
						kana: "インド",
						romaji: romajiVariants("indo"),
						vietnamese: "Ấn Độ",
						vietnameseAnswers: vAns("Ấn Độ", ["nước ấn độ"])
					},
					{
						id: "b2_3_doitsu",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "ドイツ",
						display: "ドイツ",
						kana: "ドイツ",
						romaji: romajiVariants("doitsu"),
						vietnamese: "Đức",
						vietnameseAnswers: vAns("Đức", ["nước đức"])
					},
					{
						id: "b2_3_furansu",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "フランス",
						display: "フランス",
						kana: "フランス",
						romaji: romajiVariants("furansu"),
						vietnamese: "Pháp",
						vietnameseAnswers: vAns("Pháp", ["nước pháp"])
					},
					{
						id: "b2_3_saifu",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "財布（さいふ）",
						display: "財布 (さいふ)",
						kana: "さいふ",
						romaji: romajiVariants("saifu"),
						vietnamese: "Ví tiền",
						vietnameseAnswers: vAns("Ví tiền", ["ví", "bóp tiền"])
					},
					{
						id: "b2_3_eigo",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "英語（えいご）",
						display: "英語 (えいご)",
						kana: "えいご",
						romaji: romajiVariants("eigo"),
						vietnamese: "Tiếng Anh",
						vietnameseAnswers: vAns("Tiếng Anh")
					},
					{
						id: "b2_3_go",
						lessonId: "2",
						subLessonId: "2.3",
						japanese: "～語（ご）",
						display: "～語 (ご)",
						kana: "ご",
						romaji: romajiVariants("go", ["~go"]),
						vietnamese: "Tiếng (quốc gia)",
						vietnameseAnswers: vAns("Tiếng", ["tiếng nước", "ngôn ngữ"])
					}
				]
			},
			{
				id: "2.4",
				lessonId: "2",
				title: "2.4. Số lượng và gọi món",
				description: "Số lượng và gọi món",
				items: [
					{
						id: "b2_4_tsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "～つ",
						display: "～つ",
						kana: "つ",
						romaji: romajiVariants("tsu", ["~tsu"]),
						vietnamese: "Cái, chiếc (số lượng)",
						vietnameseAnswers: vAns("Cái, chiếc", ["cái", "chiếc"])
					},
					{
						id: "b2_4_hitotsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "ひとつ",
						display: "ひとつ",
						kana: "ひとつ",
						romaji: romajiVariants("hitotsu"),
						vietnamese: "Một cái",
						vietnameseAnswers: vAns("Một cái", ["1 cái"])
					},
					{
						id: "b2_4_futatsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "ふたつ",
						display: "ふたつ",
						kana: "ふたつ",
						romaji: romajiVariants("futatsu"),
						vietnamese: "Hai cái",
						vietnameseAnswers: vAns("Hai cái", ["2 cái"])
					},
					{
						id: "b2_4_mittsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "みっつ",
						display: "みっつ",
						kana: "みっつ",
						romaji: romajiVariants("mittsu"),
						vietnamese: "Ba cái",
						vietnameseAnswers: vAns("Ba cái", ["3 cái"])
					},
					{
						id: "b2_4_yottsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "よっつ",
						display: "よっつ",
						kana: "よっつ",
						romaji: romajiVariants("yottsu"),
						vietnamese: "Bốn cái",
						vietnameseAnswers: vAns("Bốn cái", ["4 cái"])
					},
					{
						id: "b2_4_itsutsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "いつつ",
						display: "いつつ",
						kana: "いつつ",
						romaji: romajiVariants("itsutsu"),
						vietnamese: "Năm cái",
						vietnameseAnswers: vAns("Năm cái", ["5 cái"])
					},
					{
						id: "b2_4_muttsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "むっつ",
						display: "むっつ",
						kana: "むっつ",
						romaji: romajiVariants("muttsu"),
						vietnamese: "Sáu cái",
						vietnameseAnswers: vAns("Sáu cái", ["6 cái"])
					},
					{
						id: "b2_4_nanatsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "ななつ",
						display: "ななつ",
						kana: "ななつ",
						romaji: romajiVariants("nanatsu"),
						vietnamese: "Bảy cái",
						vietnameseAnswers: vAns("Bảy cái", ["7 cái"])
					},
					{
						id: "b2_4_yattsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "やっつ",
						display: "やっつ",
						kana: "やっつ",
						romaji: romajiVariants("yattsu"),
						vietnamese: "Tám cái",
						vietnameseAnswers: vAns("Tám cái", ["8 cái"])
					},
					{
						id: "b2_4_kokonotsu",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "ここのつ",
						display: "ここのつ",
						kana: "ここのつ",
						romaji: romajiVariants("kokonotsu"),
						vietnamese: "Chín cái",
						vietnameseAnswers: vAns("Chín cái", ["9 cái"])
					},
					{
						id: "b2_4_to",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "とお",
						display: "とお",
						kana: "とお",
						romaji: romajiVariants("tō", ["too", "to"]),
						vietnamese: "Mười cái",
						vietnameseAnswers: vAns("Mười cái", ["10 cái"])
					},
					{
						id: "b2_4_dare",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "だれ",
						display: "だれ",
						kana: "だれ",
						romaji: romajiVariants("dare"),
						vietnamese: "Ai",
						vietnameseAnswers: vAns("Ai", ["người nào"])
					},
					{
						id: "b2_4_chumon",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "注文をお願いします",
						display: "注文をお願いします",
						kana: "ちゅうもんをおねがいします",
						romaji: romajiVariants("chūmon o onegaishimasu", [
							"chuumon o onegaishimasu",
							"chumon o onegaishimasu"
						]),
						vietnamese: "Cho tôi gọi món",
						vietnameseAnswers: vAns("Cho tôi gọi món", [
							"tôi muốn gọi món",
							"gọi món"
						])
					},
					{
						id: "b2_4_dozo",
						lessonId: "2",
						subLessonId: "2.4",
						japanese: "どうぞ",
						display: "どうぞ",
						kana: "どうぞ",
						romaji: romajiVariants("dōzo", ["douzo", "dozo"]),
						vietnamese: "Xin mời",
						vietnameseAnswers: vAns("Xin mời", ["mời"])
					}
				]
			}
		]
	},
	{
		id: "3",
		title: "Bài 3",
		description: "Thời gian, lịch trình và hoạt động hằng ngày",
		subLessons: [
			{
				id: "3.1",
				lessonId: "3",
				title: "3.1. Thời gian và giờ giấc",
				description: "何時までですか",
				items: [
					{
						id: "b3_1_ima",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "今（いま）",
						display: "今 (いま)",
						kana: "いま",
						romaji: romajiVariants("ima"),
						vietnamese: "Bây giờ",
						vietnameseAnswers: vAns("Bây giờ", ["hiện tại"])
					},
					{
						id: "b3_1_gozen",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "午前（ごぜん）",
						display: "午前 (ごぜん)",
						kana: "ごぜん",
						romaji: romajiVariants("gozen"),
						vietnamese: "Buổi sáng, AM",
						vietnameseAnswers: vAns("Buổi sáng, AM", [
							"buổi sáng",
							"sáng",
							"am"
						])
					},
					{
						id: "b3_1_gogo",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "午後（ごご）",
						display: "午後 (ごご)",
						kana: "ごご",
						romaji: romajiVariants("gogo"),
						vietnamese: "Buổi chiều, PM",
						vietnameseAnswers: vAns("Buổi chiều, PM", [
							"buổi chiều",
							"chiều",
							"pm"
						])
					},
					{
						id: "b3_1_hiru",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "昼（ひる）",
						display: "昼 (ひる)",
						kana: "ひる",
						romaji: romajiVariants("hiru"),
						vietnamese: "Buổi trưa",
						vietnameseAnswers: vAns("Buổi trưa", ["trưa"])
					},
					{
						id: "b3_1_ginko",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "銀行（ぎんこう）",
						display: "銀行 (ぎんこう)",
						kana: "ぎんこう",
						romaji: romajiVariants("ginkō", ["ginkou", "ginko"]),
						vietnamese: "Ngân hàng",
						vietnameseAnswers: vAns("Ngân hàng")
					},
					{
						id: "b3_1_taiikukan",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "体育館（たいいくかん）",
						display: "体育館 (たいいくかん)",
						kana: "たいいくかん",
						romaji: romajiVariants("taiikukan"),
						vietnamese: "Nhà thi đấu, phòng thể dục",
						vietnameseAnswers: vAns("Nhà thi đấu, phòng thể dục", [
							"nhà thi đấu",
							"phòng thể dục"
						])
					},
					{
						id: "b3_1_toshokan",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "図書館（としょかん）",
						display: "図書館 (としょかん)",
						kana: "としょかん",
						romaji: romajiVariants("toshokan"),
						vietnamese: "Thư viện",
						vietnameseAnswers: vAns("Thư viện")
					},
					{
						id: "b3_1_byoin",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "病院（びょういん）",
						display: "病院 (びょういん)",
						kana: "びょういん",
						romaji: romajiVariants("byōin", ["byouin", "byoin"]),
						vietnamese: "Bệnh viện",
						vietnameseAnswers: vAns("Bệnh viện")
					},
					{
						id: "b3_1_yubinkyoku",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "郵便局（ゆうびんきょく）",
						display: "郵便局 (ゆうびんきょく)",
						kana: "ゆうびんきょく",
						romaji: romajiVariants("yūbinkyoku", ["yuubinkyoku", "yubinkyoku"]),
						vietnamese: "Bưu điện",
						vietnameseAnswers: vAns("Bưu điện")
					},
					{
						id: "b3_1_jugyo",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "授業（じゅぎょう）",
						display: "授業 (じゅぎょう)",
						kana: "じゅぎょう",
						romaji: romajiVariants("jugyō", ["jugyou", "jugyo"]),
						vietnamese: "Giờ học",
						vietnameseAnswers: vAns("Giờ học", ["tiết học", "buổi học"])
					},
					{
						id: "b3_1_tesuto",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "テスト",
						display: "テスト",
						kana: "テスト",
						romaji: romajiVariants("tesuto"),
						vietnamese: "Bài kiểm tra",
						vietnameseAnswers: vAns("Bài kiểm tra", ["kiểm tra", "bài thi"])
					},
					{
						id: "b3_1_yasumi",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "休み（やすみ）",
						display: "休み (やすみ)",
						kana: "やすみ",
						romaji: romajiVariants("yasumi"),
						vietnamese: "Nghỉ, ngày nghỉ",
						vietnameseAnswers: vAns("Nghỉ, ngày nghỉ", [
							"ngày nghỉ",
							"nghỉ ngơi",
							"nghỉ"
						])
					},
					{
						id: "b3_1_jikan",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "時間（じかん）",
						display: "時間 (じかん)",
						kana: "じかん",
						romaji: romajiVariants("jikan"),
						vietnamese: "Thời gian",
						vietnameseAnswers: vAns("Thời gian", ["giờ giấc"])
					},
					{
						id: "b3_1_ji",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "～時（じ）",
						display: "～時 (じ)",
						kana: "じ",
						romaji: romajiVariants("ji", ["~ji"]),
						vietnamese: "~ giờ",
						vietnameseAnswers: vAns("~ giờ", ["giờ"])
					},
					{
						id: "b3_1_fun",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "～分（ふん／ぷん）",
						display: "～分 (ふん／ぷん)",
						kana: "ふん",
						romaji: romajiVariants("fun", ["pun", "~fun", "~pun"]),
						vietnamese: "~ phút",
						vietnameseAnswers: vAns("~ phút", ["phút"])
					},
					{
						id: "b3_1_jihan",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "～時半（じはん）",
						display: "～時半 (じはん)",
						kana: "じはん",
						romaji: romajiVariants("ji han", ["jihan", "~ji han"]),
						vietnamese: "~ giờ rưỡi",
						vietnameseAnswers: vAns("~ giờ rưỡi", ["giờ rưỡi"])
					},
					{
						id: "b3_1_yobi",
						lessonId: "3",
						subLessonId: "3.1",
						japanese: "～曜日（ようび）",
						display: "～曜日 (ようび)",
						kana: "ようび",
						romaji: romajiVariants("yōbi", ["youbi", "yobi", "~yobi"]),
						vietnamese: "Thứ ~",
						vietnameseAnswers: vAns("Thứ ~", ["thứ"])
					}
				]
			},
			{
				id: "3.2",
				lessonId: "3",
				title: "3.2. Lịch trình và sự kiện",
				description: "私のスケジュール",
				items: [
					{
						id: "b3_2_sukejuru",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "スケジュール",
						display: "スケジュール",
						kana: "スケジュール",
						romaji: romajiVariants("sukejūru", ["sukejuuru", "sukejuru"]),
						vietnamese: "Lịch trình, kế hoạch",
						vietnameseAnswers: vAns("Lịch trình, kế hoạch", [
							"lịch trình",
							"kế hoạch"
						])
					},
					{
						id: "b3_2_arubaito",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "アルバイト",
						display: "アルバイト",
						kana: "アルバイト",
						romaji: romajiVariants("arubaito"),
						vietnamese: "Việc làm thêm",
						vietnameseAnswers: vAns("Việc làm thêm", ["làm thêm", "baito"])
					},
					{
						id: "b3_2_suki",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "スキー",
						display: "スキー",
						kana: "スキー",
						romaji: romajiVariants("sukī", ["sukii", "suki"]),
						vietnamese: "Trượt tuyết",
						vietnameseAnswers: vAns("Trượt tuyết")
					},
					{
						id: "b3_2_pati",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "パーティー",
						display: "パーティー",
						kana: "パーティー",
						romaji: romajiVariants("pātī", ["paatii", "pati"]),
						vietnamese: "Bữa tiệc",
						vietnameseAnswers: vAns("Bữa tiệc", ["tiệc"])
					},
					{
						id: "b3_2_babekyu",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "バーベキュー",
						display: "バーベキュー",
						kana: "バーベキュー",
						romaji: romajiVariants("bābekyū", ["baabekyuu", "babekyu"]),
						vietnamese: "Tiệc nướng ngoài trời",
						vietnameseAnswers: vAns("Tiệc nướng ngoài trời", [
							"tiệc nướng",
							"bbq"
						])
					},
					{
						id: "b3_2_hanabi",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "花火（はなび）",
						display: "花火 (はなび)",
						kana: "はなび",
						romaji: romajiVariants("hanabi"),
						vietnamese: "Pháo hoa",
						vietnameseAnswers: vAns("Pháo hoa")
					},
					{
						id: "b3_2_hanami",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "花見（はなみ）",
						display: "花見 (はなみ)",
						kana: "はなみ",
						romaji: romajiVariants("hanami"),
						vietnamese: "Ngắm hoa",
						vietnameseAnswers: vAns("Ngắm hoa", ["ngắm hoa anh đào"])
					},
					{
						id: "b3_2_homusutei",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "ホームステイ",
						display: "ホームステイ",
						kana: "ホームステイ",
						romaji: romajiVariants("hōmusutei", ["houmusutei", "homusutei"]),
						vietnamese: "Ở cùng gia đình bản địa",
						vietnameseAnswers: vAns("Ở cùng gia đình bản địa", [
							"homestay",
							"ở nhà bản địa"
						])
					},
					{
						id: "b3_2_matsuri",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "祭り（まつり）",
						display: "祭り (まつり)",
						kana: "まつり",
						romaji: romajiVariants("matsuri"),
						vietnamese: "Lễ hội",
						vietnameseAnswers: vAns("Lễ hội")
					},
					{
						id: "b3_2_umi",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "海（うみ）",
						display: "海 (うみ)",
						kana: "うみ",
						romaji: romajiVariants("umi"),
						vietnamese: "Biển",
						vietnameseAnswers: vAns("Biển", ["bãi biển"])
					},
					{
						id: "b3_2_koen",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "公園（こうえん）",
						display: "公園 (こうえん)",
						kana: "こうえん",
						romaji: romajiVariants("kōen", ["kouen", "koen"]),
						vietnamese: "Công viên",
						vietnameseAnswers: vAns("Công viên")
					},
					{
						id: "b3_2_sakura",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "桜（さくら）",
						display: "桜 (さくら)",
						kana: "さくら",
						romaji: romajiVariants("sakura"),
						vietnamese: "Hoa anh đào",
						vietnameseAnswers: vAns("Hoa anh đào", ["anh đào"])
					},
					{
						id: "b3_2_sake",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "酒（さけ）",
						display: "酒 (さけ)",
						kana: "さけ",
						romaji: romajiVariants("sake"),
						vietnamese: "Rượu Nhật",
						vietnameseAnswers: vAns("Rượu Nhật", ["rượu", "rượu sake"])
					},
					{
						id: "b3_2_sushi",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "すし",
						display: "すし",
						kana: "すし",
						romaji: romajiVariants("sushi"),
						vietnamese: "Sushi",
						vietnameseAnswers: vAns("Sushi")
					},
					{
						id: "b3_2_basu",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "バス",
						display: "バス",
						kana: "バス",
						romaji: romajiVariants("basu"),
						vietnamese: "Xe buýt",
						vietnameseAnswers: vAns("Xe buýt", ["xe bus"])
					},
					{
						id: "b3_2_bento",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "弁当（べんとう）",
						display: "弁当 (べんとう)",
						kana: "べんとう",
						romaji: romajiVariants("bentō", ["bentou", "bento"]),
						vietnamese: "Cơm hộp",
						vietnameseAnswers: vAns("Cơm hộp", ["hộp cơm", "bento"])
					},
					{
						id: "b3_2_ryugakusei",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "留学生（りゅうがくせい）",
						display: "留学生 (りゅうがくせい)",
						kana: "りゅうがくせい",
						romaji: romajiVariants("ryūgakusei", ["ryuugakusei", "ryugakusei"]),
						vietnamese: "Du học sinh",
						vietnameseAnswers: vAns("Du học sinh")
					},
					{
						id: "b3_2_ichinen",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "一年（いちねん）",
						display: "一年 (いちねん)",
						kana: "いちねん",
						romaji: romajiVariants("ichinen"),
						vietnamese: "Một năm",
						vietnameseAnswers: vAns("Một năm", ["1 năm"])
					},
					{
						id: "b3_2_haru",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "春（はる）",
						display: "春 (はる)",
						kana: "はる",
						romaji: romajiVariants("haru"),
						vietnamese: "Mùa xuân",
						vietnameseAnswers: vAns("Mùa xuân")
					},
					{
						id: "b3_2_natsu",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "夏（なつ）",
						display: "夏 (なつ)",
						kana: "なつ",
						romaji: romajiVariants("natsu"),
						vietnamese: "Mùa hè",
						vietnameseAnswers: vAns("Mùa hè")
					},
					{
						id: "b3_2_aki",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "秋（あき）",
						display: "秋 (あき)",
						kana: "あき",
						romaji: romajiVariants("aki"),
						vietnamese: "Mùa thu",
						vietnameseAnswers: vAns("Mùa thu")
					},
					{
						id: "b3_2_fuyu",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "冬（ふゆ）",
						display: "冬 (ふゆ)",
						kana: "ふゆ",
						romaji: romajiVariants("fuyu"),
						vietnamese: "Mùa đông",
						vietnameseAnswers: vAns("Mùa đông")
					},
					{
						id: "b3_2_gorudenwiku",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "ゴールデンウィーク",
						display: "ゴールデンウィーク",
						kana: "ゴールデンウィーク",
						romaji: romajiVariants("gōruden wīku", [
							"gooruden wiiku",
							"golden week"
						]),
						vietnamese: "Tuần lễ vàng",
						vietnameseAnswers: vAns("Tuần lễ vàng")
					},
					{
						id: "b3_2_nani",
						lessonId: "3",
						subLessonId: "3.2",
						japanese: "何（なに）",
						display: "何 (なに)",
						kana: "なに",
						romaji: romajiVariants("nani", ["nan"]),
						vietnamese: "Cái gì",
						vietnameseAnswers: vAns("Cái gì", ["gì"])
					}
				]
			},
			{
				id: "3.3",
				lessonId: "3",
				title: "3.3. Hoạt động hằng ngày",
				description: "どんな毎日？",
				items: [
					{
						id: "b3_3_asa",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "朝（あさ）",
						display: "朝 (あさ)",
						kana: "あさ",
						romaji: romajiVariants("asa"),
						vietnamese: "Buổi sáng",
						vietnameseAnswers: vAns("Buổi sáng", ["sáng"])
					},
					{
						id: "b3_3_ban",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "晩（ばん）",
						display: "晩 (ばん)",
						kana: "ばん",
						romaji: romajiVariants("ban"),
						vietnamese: "Buổi tối",
						vietnameseAnswers: vAns("Buổi tối", ["tối"])
					},
					{
						id: "b3_3_yoru",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "夜（よる）",
						display: "夜 (よる)",
						kana: "よる",
						romaji: romajiVariants("yoru"),
						vietnamese: "Ban đêm",
						vietnameseAnswers: vAns("Ban đêm", ["đêm"])
					},
					{
						id: "b3_3_mainichi",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "毎日（まいにち）",
						display: "毎日 (まいにち)",
						kana: "まいにち",
						romaji: romajiVariants("mainichi"),
						vietnamese: "Hằng ngày",
						vietnameseAnswers: vAns("Hằng ngày", ["mỗi ngày"])
					},
					{
						id: "b3_3_maiasa",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "毎朝（まいあさ）",
						display: "毎朝 (まいあさ)",
						kana: "まいあさ",
						romaji: romajiVariants("maiasa"),
						vietnamese: "Mỗi sáng",
						vietnameseAnswers: vAns("Mỗi sáng", ["mỗi buổi sáng"])
					},
					{
						id: "b3_3_maiban",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "毎晩（まいばん）",
						display: "毎晩 (まいばん)",
						kana: "まいばん",
						romaji: romajiVariants("maiban"),
						vietnamese: "Mỗi tối",
						vietnameseAnswers: vAns("Mỗi tối", ["mỗi buổi tối"])
					},
					{
						id: "b3_3_asagohan",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "朝ご飯（あさごはん）",
						display: "朝ご飯 (あさごはん)",
						kana: "あさごはん",
						romaji: romajiVariants("asagohan"),
						vietnamese: "Bữa sáng",
						vietnameseAnswers: vAns("Bữa sáng", ["ăn sáng", "cơm sáng"])
					},
					{
						id: "b3_3_hirugohan",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "昼ご飯（ひるごはん）",
						display: "昼ご飯 (ひるごはん)",
						kana: "ひるごはん",
						romaji: romajiVariants("hirugohan"),
						vietnamese: "Bữa trưa",
						vietnameseAnswers: vAns("Bữa trưa", ["ăn trưa", "cơm trưa"])
					},
					{
						id: "b3_3_bangohan",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "晩ご飯（ばんごはん）",
						display: "晩ご飯 (ばんごはん)",
						kana: "ばんごはん",
						romaji: romajiVariants("bangohan"),
						vietnamese: "Bữa tối",
						vietnameseAnswers: vAns("Bữa tối", ["ăn tối", "cơm tối"])
					},
					{
						id: "b3_3_uchi",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "家（うち）",
						display: "家 (うち)",
						kana: "うち",
						romaji: romajiVariants("uchi", ["ie"]),
						vietnamese: "Nhà",
						vietnameseAnswers: vAns("Nhà", ["ngôi nhà"])
					},
					{
						id: "b3_3_kaisha",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "会社（かいしゃ）",
						display: "会社 (かいしゃ)",
						kana: "かいしゃ",
						romaji: romajiVariants("kaisha"),
						vietnamese: "Công ty",
						vietnameseAnswers: vAns("Công ty")
					},
					{
						id: "b3_3_gakko",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "学校（がっこう）",
						display: "学校 (がっこう)",
						kana: "がっこう",
						romaji: romajiVariants("gakkō", ["gakkou", "gakko"]),
						vietnamese: "Trường học",
						vietnameseAnswers: vAns("Trường học", ["trường"])
					},
					{
						id: "b3_3_konbini",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "コンビニ",
						display: "コンビニ",
						kana: "コンビニ",
						romaji: romajiVariants("konbini"),
						vietnamese: "Cửa hàng tiện lợi",
						vietnameseAnswers: vAns("Cửa hàng tiện lợi", ["tiệm tiện lợi"])
					},
					{
						id: "b3_3_gyunyu",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "牛乳（ぎゅうにゅう）",
						display: "牛乳 (ぎゅうにゅう)",
						kana: "ぎゅうにゅう",
						romaji: romajiVariants("gyūnyū", ["gyuunyuu", "gyunyu"]),
						vietnamese: "Sữa bò",
						vietnameseAnswers: vAns("Sữa bò", ["sữa", "sữa tươi"])
					},
					{
						id: "b3_3_kudamono",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "果物（くだもの）",
						display: "果物 (くだもの)",
						kana: "くだもの",
						romaji: romajiVariants("kudamono"),
						vietnamese: "Hoa quả",
						vietnameseAnswers: vAns("Hoa quả", ["trái cây"])
					},
					{
						id: "b3_3_sarada",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "サラダ",
						display: "サラダ",
						kana: "サラダ",
						romaji: romajiVariants("sarada"),
						vietnamese: "Salad",
						vietnameseAnswers: vAns("Salad", ["rau trộn"])
					},
					{
						id: "b3_3_chizu",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "チーズ",
						display: "チーズ",
						kana: "チーズ",
						romaji: romajiVariants("chīzu", ["chiizu", "chizu"]),
						vietnamese: "Phô mai",
						vietnameseAnswers: vAns("Phô mai", ["pho mát"])
					},
					{
						id: "b3_3_intanetto",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "インターネット",
						display: "インターネット",
						kana: "インターネット",
						romaji: romajiVariants("intānetto", ["intaanetto", "internet"]),
						vietnamese: "Internet",
						vietnameseAnswers: vAns("Internet", ["mạng internet", "mạng"])
					},
					{
						id: "b3_3_shinbun",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "新聞（しんぶん）",
						display: "新聞 (しんぶん)",
						kana: "しんぶん",
						romaji: romajiVariants("shinbun"),
						vietnamese: "Báo",
						vietnameseAnswers: vAns("Báo", ["tờ báo", "báo giấy"])
					},
					{
						id: "b3_3_terebi",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "テレビ",
						display: "テレビ",
						kana: "テレビ",
						romaji: romajiVariants("terebi"),
						vietnamese: "Tivi",
						vietnameseAnswers: vAns("Tivi", ["ti vi", "truyền hình"])
					},
					{
						id: "b3_3_cd",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "CD",
						display: "CD",
						kana: "シーディー",
						romaji: romajiVariants("shī dī", ["cd", "shiidii"]),
						vietnamese: "Đĩa CD",
						vietnameseAnswers: vAns("Đĩa CD", ["đĩa nhạc", "cd"])
					},
					{
						id: "b3_3_dvd",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "DVD",
						display: "DVD",
						kana: "ディーブイディー",
						romaji: romajiVariants("dī bui dī", ["dvd", "diibuidii"]),
						vietnamese: "Đĩa DVD",
						vietnameseAnswers: vAns("Đĩa DVD", ["dvd"])
					},
					{
						id: "b3_3_nanimo",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "何も（なにも）",
						display: "何も (なにも)",
						kana: "なにも",
						romaji: romajiVariants("nanimo"),
						vietnamese: "Không gì cả (với câu phủ định)",
						vietnameseAnswers: vAns("Không gì cả", [
							"chẳng có gì",
							"không có gì"
						])
					},
					{
						id: "b3_3_dokomo",
						lessonId: "3",
						subLessonId: "3.3",
						japanese: "どこ（へ）も",
						display: "どこ（へ）も",
						kana: "どこへも",
						romaji: romajiVariants("doko (e) mo", ["doko e mo", "dokomo"]),
						vietnamese: "Không đi đâu cả (với câu phủ định)",
						vietnameseAnswers: vAns("Không đi đâu cả", [
							"chẳng đi đâu cả",
							"không đâu cả"
						])
					}
				]
			},
			{
				id: "3.4",
				lessonId: "3",
				title: "3.4. Động từ Bài 3",
				description: "Động từ Bài 3",
				items: [
					{
						id: "b3_4_kaimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "買います（かいます）",
						display: "買います (かいます)",
						kana: "かいます",
						romaji: romajiVariants("kaimasu"),
						vietnamese: "Mua",
						vietnameseAnswers: vAns("Mua")
					},
					{
						id: "b3_4_kikimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "聞きます（ききます）",
						display: "聞きます (ききます)",
						kana: "ききます",
						romaji: romajiVariants("kikimasu"),
						vietnamese: "Nghe, hỏi",
						vietnameseAnswers: vAns("Nghe, hỏi", ["nghe", "hỏi"])
					},
					{
						id: "b3_4_hatarakimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "働きます（はたらきます）",
						display: "働きます (はたらきます)",
						kana: "はたらきます",
						romaji: romajiVariants("hatarakimasu"),
						vietnamese: "Làm việc",
						vietnameseAnswers: vAns("Làm việc")
					},
					{
						id: "b3_4_yomimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "読みます（よみます）",
						display: "読みます (よみます)",
						kana: "よみます",
						romaji: romajiVariants("yomimasu"),
						vietnamese: "Đọc",
						vietnameseAnswers: vAns("Đọc", ["đọc sách"])
					},
					{
						id: "b3_4_ikimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "行きます（いきます）",
						display: "行きます (いきます)",
						kana: "いきます",
						romaji: romajiVariants("ikimasu"),
						vietnamese: "Đi",
						vietnameseAnswers: vAns("Đi")
					},
					{
						id: "b3_4_kaerimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "帰ります（かえります）",
						display: "帰ります (かえります)",
						kana: "かえります",
						romaji: romajiVariants("kaerimasu"),
						vietnamese: "Trở về",
						vietnameseAnswers: vAns("Trở về", ["về", "về nhà"])
					},
					{
						id: "b3_4_nomimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "飲みます（のみます）",
						display: "飲みます (のみます)",
						kana: "のみます",
						romaji: romajiVariants("nomimasu"),
						vietnamese: "Uống",
						vietnameseAnswers: vAns("Uống", ["uống nước"])
					},
					{
						id: "b3_4_tabemasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "食べます（たべます）",
						display: "食べます (たべます)",
						kana: "たべます",
						romaji: romajiVariants("tabemasu"),
						vietnamese: "Ăn",
						vietnameseAnswers: vAns("Ăn", ["ăn cơm"])
					},
					{
						id: "b3_4_mimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "見ます（みます）",
						display: "見ます (みます)",
						kana: "みます",
						romaji: romajiVariants("mimasu"),
						vietnamese: "Xem, nhìn",
						vietnameseAnswers: vAns("Xem, nhìn", ["xem", "nhìn"])
					},
					{
						id: "b3_4_okimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "起きます（おきます）",
						display: "起きます (おきます)",
						kana: "おきます",
						romaji: romajiVariants("okimasu"),
						vietnamese: "Thức dậy",
						vietnameseAnswers: vAns("Thức dậy", ["dậy"])
					},
					{
						id: "b3_4_nemasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "寝ます（ねます）",
						display: "寝ます (ねます)",
						kana: "ねます",
						romaji: romajiVariants("nemasu"),
						vietnamese: "Ngủ",
						vietnameseAnswers: vAns("Ngủ", ["đi ngủ"])
					},
					{
						id: "b3_4_benkyoshimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "勉強します（べんきょうします）",
						display: "勉強します (べんきょうします)",
						kana: "べんきょうします",
						romaji: romajiVariants("benkyō shimasu", [
							"benkyou shimasu",
							"benkyoshimasu"
						]),
						vietnamese: "Học, học bài",
						vietnameseAnswers: vAns("Học, học bài", ["học", "học bài"])
					},
					{
						id: "b3_4_kimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "来ます（きます）",
						display: "来ます (きます)",
						kana: "きます",
						romaji: romajiVariants("kimasu"),
						vietnamese: "Đến",
						vietnameseAnswers: vAns("Đến", ["tới"])
					},
					{
						id: "b3_4_shimasu",
						lessonId: "3",
						subLessonId: "3.4",
						japanese: "します",
						display: "します",
						kana: "します",
						romaji: romajiVariants("shimasu"),
						vietnamese: "Làm, chơi",
						vietnameseAnswers: vAns("Làm, chơi", ["làm", "chơi"])
					}
				]
			},
			{
				id: "3.5",
				lessonId: "3",
				title: "3.5. Mẫu câu và biểu đạt Bài 3",
				description: "Mẫu câu và biểu đạt",
				items: [
					{
						id: "b3_5_iidesune",
						lessonId: "3",
						subLessonId: "3.5",
						japanese: "いいですね",
						display: "いいですね",
						kana: "いいですね",
						romaji: romajiVariants("ii desu ne", ["iidesune"]),
						vietnamese: "Hay quá nhỉ!",
						vietnameseAnswers: vAns("Hay quá nhỉ!", [
							"hay quá",
							"tuyệt quá nhỉ",
							"được đấy"
						])
					},
					{
						id: "b3_5_e",
						lessonId: "3",
						subLessonId: "3.5",
						japanese: "えっ",
						display: "えっ",
						kana: "えっ",
						romaji: romajiVariants("e", ["e!"]),
						vietnamese: "Ơ! / Hả?",
						vietnameseAnswers: vAns("Ơ! / Hả?", ["ơ", "hả", "ơ!", "hả?"])
					},
					{
						id: "b3_5_he",
						lessonId: "3",
						subLessonId: "3.5",
						japanese: "へえ",
						display: "へえ",
						kana: "へえ",
						romaji: romajiVariants("hē", ["hee", "he"]),
						vietnamese: "Chà! / Wow!",
						vietnameseAnswers: vAns("Chà! / Wow!", ["chà", "wow", "thế cơ à"])
					}
				]
			}
		]
	}
]

// Vocabulary practice shows readings; Kanji practice has its own dataset.
for (const lesson of lessonsData) {
	for (const sub of lesson.subLessons) {
		for (const item of sub.items) {
			if (/\p{Script=Han}/u.test(item.japanese)) {
				item.display = toHiragana(item.kana)
			}
		}
	}
}

// All vocabulary items flat
export const allVocabItems: VocabItem[] = lessonsData.flatMap((lesson) =>
	lesson.subLessons.flatMap((sub) => sub.items)
)

export const vocabItemById = new Map<string, VocabItem>(
	allVocabItems.map((item) => [item.id, item])
)

// Map for prompt text -> list of acceptable answers
export const vocabPromptAnswersMap = new Map<string, string[]>()

// Map for prompt text -> speech text
export const vocabPromptSpeechMap = new Map<string, string>()

// Populate the prompt answers
for (const item of allVocabItems) {
	// 1. Japanese prompt (Japanese -> Vietnamese)
	// Display e.g. "私 (わたし)" or "アメリカ"
	vocabPromptAnswersMap.set(item.display, item.vietnameseAnswers)
	vocabPromptSpeechMap.set(item.display, item.kana)

	// In case kana only is used
	if (!vocabPromptAnswersMap.has(item.kana)) {
		vocabPromptAnswersMap.set(item.kana, item.vietnameseAnswers)
		vocabPromptSpeechMap.set(item.kana, item.kana)
	}

	// 2. Vietnamese prompt (Vietnamese -> Japanese)
	// Display e.g. "Tôi" or "Thầy/cô giáo"
	const jpAnswers = [
		item.kana,
		...item.romaji,
		// Also accept romaji without spaces if prompt had spaces
		...item.romaji.map((r) => r.replace(/\s+/g, ""))
	]
	vocabPromptAnswersMap.set(item.vietnamese, jpAnswers)
	vocabPromptSpeechMap.set(item.vietnamese, item.kana)
}
