import type {
	KanjiItem,
	MeaningLanguage,
	PronunciationMode,
	VocabularyGroup
} from "./vocabulary.ts"
import { selectVocabulary } from "./vocabulary.ts"
export interface Answer {
	pronunciation: string
	meaning: string
}
export type Answers = Record<string, Answer>
export interface Grade {
	pronunciation: boolean
	meaning: boolean
}
export type Grades = Record<string, Grade>
export function normalize(value: string) {
	return value
		.normalize("NFKC")
		.trim()
		.replace(/\s+/gu, " ")
		.toLocaleLowerCase("vi")
}
export function normalizeReading(value: string, mode: PronunciationMode) {
	const normalized = normalize(value)
	// Only explicitly equivalent long vowels; never drop vowels or guess readings.
	return mode === "romaji"
		? normalized.replace(/ō/g, "ou").replace(/ū/g, "uu")
		: normalized
}
export function gradeItem(
	item: KanjiItem,
	answer: Answer | undefined,
	mode: PronunciationMode
): Grade {
	return {
		pronunciation: item[mode].some(
			(reading) =>
				normalizeReading(reading, mode) ===
				normalizeReading(answer?.pronunciation ?? "", mode)
		),
		meaning: gradeMeaning(item, answer?.meaning)
	}
}

export function gradeMeaning(
	item: KanjiItem,
	answer: string | undefined,
	_language?: MeaningLanguage
) {
	const meanings = [...item.acceptedMeanings, ...item.englishMeanings]
	return meanings.some((meaning) => normalize(meaning) === normalize(answer ?? ""))
}
export function gradeQuiz(
	items: KanjiItem[],
	answers: Answers,
	mode: PronunciationMode,
	meaningLanguage: MeaningLanguage = "vietnamese"
): Grades {
	return Object.fromEntries(
		items.map((item) => [
			item.id,
			{
				pronunciation: gradeItem(item, answers[item.id], mode).pronunciation,
				meaning: gradeMeaning(item, answers[item.id]?.meaning, meaningLanguage)
			}
		])
	)
}
export function scoreQuiz(items: KanjiItem[], grades: Grades) {
	const score = items.reduce(
		(sum, item) =>
			sum +
			Number(grades[item.id]?.pronunciation ?? false) +
			Number(grades[item.id]?.meaning ?? false),
		0
	)
	return {
		score,
		maximum: items.length * 2,
		incorrect: items.length * 2 - score
	}
}
export function incorrectItems(items: KanjiItem[], grades: Grades) {
	return items.filter(
		(item) =>
			grades[item.id] &&
			(!grades[item.id].pronunciation || !grades[item.id].meaning)
	)
}
export interface QuizState {
	group: VocabularyGroup
	mode: PronunciationMode
	answers: Answers
	grades: Grades | null
	revealed: boolean
	incorrectOnly: boolean
}
export function createQuiz(
	group: VocabularyGroup = "all",
	mode: PronunciationMode = "hiragana"
): QuizState {
	return {
		group,
		mode,
		answers: {},
		grades: null,
		revealed: false,
		incorrectOnly: false
	}
}
function clearGrading(state: QuizState): QuizState {
	return { ...state, grades: null, revealed: false, incorrectOnly: false }
}
export function updateAnswer(
	state: QuizState,
	id: string,
	field: keyof Answer,
	value: string
): QuizState {
	return clearGrading({
		...state,
		answers: {
			...state.answers,
			[id]: {
				...(state.answers[id] ?? { pronunciation: "", meaning: "" }),
				[field]: value
			}
		}
	})
}
export function changeMode(
	state: QuizState,
	mode: PronunciationMode
): QuizState {
	if (mode === state.mode) return state
	return clearGrading({
		...state,
		mode,
		answers: Object.fromEntries(
			Object.entries(state.answers).map(([id, answer]) => [
				id,
				{ ...answer, pronunciation: "" }
			])
		)
	})
}
export function changeGroup(
	state: QuizState,
	group: VocabularyGroup
): QuizState {
	return clearGrading({ ...state, group })
}
export function submitQuiz(state: QuizState): QuizState {
	return {
		...state,
		grades: gradeQuiz(selectVocabulary(state.group), state.answers, state.mode)
	}
}
