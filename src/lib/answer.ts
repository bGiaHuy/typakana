import { toHiragana, toRomaji } from "wanakana"
import { numberAnswersMap } from "./numbers"
import { vocabPromptAnswersMap, removeVietnameseTones } from "./vocabulary"

/**
 * Replacements to answers from `wanakana.toHiragana()`, for conversions that
 * don't work the other way or have multiple valid answers.
 *
 * The key here is hiragana, but it works with katakana as well.
 * https://www.tofugu.com/japanese/how-to-type-in-japanese/
 */
export const exceptionalAnswers = new Map([
	["し", ["shi", "si"]],
	["ち", ["chi", "ti"]],
	["つ", ["tsu", "tu"]],
	["ふ", ["fu", "hu"]],

	["じ", ["ji", "zi"]],
	["ぢ", ["di", "ji"]],
	["づ", ["du", "zu"]],

	["しゃ", ["sha", "sya"]],
	["しゅ", ["shu", "syu"]],
	["しょ", ["sho", "syo"]],

	["ちゃ", ["cha", "tya"]],
	["ちゅ", ["chu", "tyu"]],
	["ちょ", ["cho", "tyo"]],

	["じゃ", ["ja", "jya", "zya"]],
	["じゅ", ["ju", "jyu", "zyu"]],
	["じょ", ["jo", "jyo", "zyo"]],

	["ぢゃ", ["ja", "dya"]],
	["ぢゅ", ["ju", "dyu"]],
	["ぢょ", ["jo", "dyo"]],

	["ん", ["n", "nn"]]
])

/** Gets acceptable answers for the given kana, number, or vocabulary prompt */
export function getAnswers(kana: string): string[] {
	if (vocabPromptAnswersMap.has(kana)) {
		return vocabPromptAnswersMap.get(kana)!
	}
	if (numberAnswersMap.has(kana)) {
		return numberAnswersMap.get(kana)!
	}
	return exceptionalAnswers.get(toHiragana(kana)) ?? [toRomaji(kana)]
}

/** Checks if input matches a correct answer */
export function isCorrectAnswer(guess: string, actual: string): boolean {
	const trimmed = guess.trim().toLowerCase()
	const normalizedGuess = removeVietnameseTones(trimmed)
	const romaji = toRomaji(trimmed)
	const answers = getAnswers(actual)

	for (const ans of answers) {
		const lowerAns = ans.toLowerCase().trim()
		const normalizedAns = removeVietnameseTones(lowerAns)

		// Direct match or tone-insensitive Vietnamese match
		if (trimmed === lowerAns || normalizedGuess === normalizedAns) {
			return true
		}
		// Romaji match
		if (romaji === lowerAns || romaji === toRomaji(lowerAns)) {
			return true
		}
		// Match without spaces
		if (
			romaji.replace(/\s+/g, "") === lowerAns.replace(/\s+/g, "") ||
			normalizedGuess.replace(/\s+/g, "") === normalizedAns.replace(/\s+/g, "")
		) {
			return true
		}
	}

	return false
}
