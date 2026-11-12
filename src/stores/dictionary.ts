import { derived } from "svelte/store"
import { toKatakana } from "wanakana"
import { gameConfig, type NumberCheckboxColumn } from "./game-config"
import { numberDefinitionById } from "$/lib/numbers"
import { allVocabItems } from "$/lib/vocabulary"

function toDictionary(column: KanaCheckboxColumn): string[] {
	return column
		.flat(2)
		.filter((item): item is KanaCheckbox => item?.checked ?? false)
		.map((item) => item.kana)
}

function toNumberDictionary(
	columns: (NumberCheckboxColumn | undefined)[],
	display: "kanji" | "arabic" | "both"
): string[] {
	const result: string[] = []
	const seen = new Set<string>()

	for (const col of columns) {
		if (!col) continue
		for (const row of col) {
			for (const item of row) {
				if (item?.checked) {
					const def = numberDefinitionById.get(item.id)
					if (!def) continue

					if (display === "kanji" || display === "both") {
						if (!seen.has(def.kanji)) {
							seen.add(def.kanji)
							result.push(def.kanji)
						}
					}
					if (display === "arabic" || display === "both") {
						if (!seen.has(def.arabic)) {
							seen.add(def.arabic)
							result.push(def.arabic)
						}
					}
				}
			}
		}
	}

	return result
}

function toVocabDictionary(
	selectedSubLessons: string[],
	excludedVocabIds: string[],
	jpToVi: boolean,
	viToJp: boolean
): string[] {
	const result: string[] = []
	const subLessonSet = new Set(selectedSubLessons)
	const excludedSet = new Set(excludedVocabIds)

	// If neither direction is checked, fallback to jpToVi
	const useJpToVi = jpToVi || (!jpToVi && !viToJp)
	const useViToJp = viToJp

	for (const item of allVocabItems) {
		if (subLessonSet.has(item.subLessonId) && !excludedSet.has(item.id)) {
			if (useJpToVi) {
				result.push(item.display)
			}
			if (useViToJp) {
				result.push(item.vietnamese)
			}
		}
	}

	return result
}

export const selectedKana = derived(gameConfig, ($columns) => {
	return [
		...toDictionary($columns.gojuon),
		...toDictionary($columns.dakuon),
		...toDictionary($columns.yoon),
		...toDictionary($columns.dakuonYoon)
	]
})

export const dictionary = derived(
	[selectedKana, gameConfig],
	([$selectedKana, $gameConfig]): string[] => {
		if ($gameConfig.practiceMode === "vocab") {
			return toVocabDictionary(
				$gameConfig.selectedSubLessons ?? ["1.1", "1.2", "1.3", "1.4"],
				$gameConfig.excludedVocabIds ?? [],
				$gameConfig.vocabDirectionJpToVi ?? true,
				$gameConfig.vocabDirectionViToJp ?? false
			)
		}

		if ($gameConfig.practiceMode === "numbers") {
			return toNumberDictionary(
				[
					$gameConfig.numbersBasic,
					$gameConfig.numbersTens,
					$gameConfig.numbersObjects,
					$gameConfig.numbersPeople,
					$gameConfig.numbersDays
				],
				$gameConfig.numberDisplay ?? "both"
			)
		}

		const { kanaType } = $gameConfig
		const result: string[] = []

		if (kanaType === "hiragana" || kanaType === "both") {
			result.push(...$selectedKana)
		}
		if (kanaType === "katakana" || kanaType === "both") {
			result.push(...$selectedKana.map((kana) => toKatakana(kana)))
		}

		return result
	}
)
