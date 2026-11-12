import { hiragana } from "$/lib/db"
import { persistent } from "$/lib/persistent"
import { numberCategories } from "$/lib/numbers"

function createKanaCheckbox(
	kana: string | null,
	checked: boolean
): KanaCheckbox | null {
	if (kana) {
		return {
			kana: kana,
			checked: checked
		}
	} else {
		return null
	}
}

function createKanaCheckboxRow(
	kana: (string | null)[],
	checked: boolean
): KanaCheckboxRow {
	return kana.map((kana) => createKanaCheckbox(kana, checked))
}

function createKanaCheckboxColumn(
	kanaRows: (string | null)[][],
	checked: boolean
): KanaCheckboxColumn {
	return kanaRows.map((row) => createKanaCheckboxRow(row, checked))
}

export interface NumberCheckboxItem {
	id: string
	checked: boolean
}

export type NumberCheckboxRow = NumberCheckboxItem[]
export type NumberCheckboxColumn = NumberCheckboxRow[]

export function createNumberCheckboxColumn(
	categoryId: string,
	checked: boolean
): NumberCheckboxColumn {
	const cat = numberCategories.find((c) => c.id === categoryId)
	if (!cat) return []
	return cat.rows.map((row) => row.map((item) => ({ id: item.id, checked })))
}

export interface GameConfig {
	practiceMode: "kana" | "numbers" | "vocab"
	kanaType: "hiragana" | "katakana" | "both"
	numberDisplay: "kanji" | "arabic" | "both"
	gojuon: KanaCheckboxColumn
	dakuon: KanaCheckboxColumn
	yoon: KanaCheckboxColumn
	dakuonYoon: KanaCheckboxColumn
	numbersBasic: NumberCheckboxColumn
	numbersTens: NumberCheckboxColumn
	numbersObjects: NumberCheckboxColumn
	numbersPeople: NumberCheckboxColumn
	numbersDays: NumberCheckboxColumn
	vocabDirectionJpToVi: boolean
	vocabDirectionViToJp: boolean
	selectedSubLessons: string[]
	excludedVocabIds: string[]
	shuffleQuestions: boolean
}

const defaultGameConfig: GameConfig = {
	practiceMode: "kana",
	kanaType: "hiragana",
	numberDisplay: "both",
	gojuon: createKanaCheckboxColumn(hiragana.gojuon, true),
	dakuon: createKanaCheckboxColumn(hiragana.dakuon, true),
	yoon: createKanaCheckboxColumn(hiragana.yoon, false),
	dakuonYoon: createKanaCheckboxColumn(hiragana.dakuonYoon, false),
	numbersBasic: createNumberCheckboxColumn("basic", true),
	numbersTens: createNumberCheckboxColumn("tens", false),
	numbersObjects: createNumberCheckboxColumn("objects", false),
	numbersPeople: createNumberCheckboxColumn("people", false),
	numbersDays: createNumberCheckboxColumn("days", false),
	vocabDirectionJpToVi: true,
	vocabDirectionViToJp: false,
	selectedSubLessons: ["1.1", "1.2", "1.3", "1.4"],
	excludedVocabIds: [],
	shuffleQuestions: true
}

export const gameConfig = persistent<GameConfig>({
	key: "game-config",
	storage_type: "sessionStorage",
	start_value: defaultGameConfig,
	deserialize: (value: string): GameConfig => {
		try {
			const parsed = JSON.parse(value)
			return {
				practiceMode: parsed.practiceMode ?? "kana",
				kanaType: parsed.kanaType ?? "hiragana",
				numberDisplay: parsed.numberDisplay ?? "both",
				gojuon:
					parsed.gojuon ?? createKanaCheckboxColumn(hiragana.gojuon, true),
				dakuon:
					parsed.dakuon ?? createKanaCheckboxColumn(hiragana.dakuon, true),
				yoon: parsed.yoon ?? createKanaCheckboxColumn(hiragana.yoon, false),
				dakuonYoon:
					parsed.dakuonYoon ??
					createKanaCheckboxColumn(hiragana.dakuonYoon, false),
				numbersBasic:
					parsed.numbersBasic ?? createNumberCheckboxColumn("basic", true),
				numbersTens:
					parsed.numbersTens ?? createNumberCheckboxColumn("tens", false),
				numbersObjects:
					parsed.numbersObjects ?? createNumberCheckboxColumn("objects", false),
				numbersPeople:
					parsed.numbersPeople ?? createNumberCheckboxColumn("people", false),
				numbersDays:
					parsed.numbersDays ?? createNumberCheckboxColumn("days", false),
				vocabDirectionJpToVi: parsed.vocabDirectionJpToVi ?? true,
				vocabDirectionViToJp: parsed.vocabDirectionViToJp ?? false,
				selectedSubLessons: parsed.selectedSubLessons ?? [
					"1.1",
					"1.2",
					"1.3",
					"1.4"
				],
				excludedVocabIds: parsed.excludedVocabIds ?? [],
				shuffleQuestions: parsed.shuffleQuestions ?? true
			}
		} catch {
			return defaultGameConfig
		}
	}
})
