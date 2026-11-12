import { toHiragana, toKatakana, toRomaji } from "wanakana"

export function answerRomaji(answer: string): string {
	return toRomaji(
		answer
			.replace(/です(?=[。！？!?]|$)/gu, " です")
			.replace(/は(?=\s)/gu, " わ")
			.replace(/へ(?=\s)/gu, " え")
			.replace(/を/gu, " お ")
	)
		.replace(/\s+/gu, " ")
		.trim()
}

function normalizeAnswer(value: string): string {
	const vowels: Record<string, string> = {
		ā: "aa",
		â: "aa",
		ī: "ii",
		î: "ii",
		ū: "uu",
		û: "uu",
		ē: "ee",
		ê: "ee",
		ō: "oo",
		ô: "oo"
	}
	const expanded = value
		.normalize("NFKC")
		.toLowerCase()
		.replace(/[āâīîūûēêōô]/gu, (v) => vowels[v])
	return toRomaji(toKatakana(toHiragana(expanded).replace(/を/gu, "お")))
		.toLowerCase()
		.replace(/[\s\p{P}\p{S}]+/gu, "")
		.replace(/ou/g, "oo")
}

export function checkRomaji(guess: string, answer: string): boolean {
	const normalized = normalizeAnswer(guess)
	return (
		normalized.length > 0 &&
		normalized === normalizeAnswer(answerRomaji(answer))
	)
}
