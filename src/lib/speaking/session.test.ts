import assert from "node:assert/strict"
import { test } from "node:test"
import { readFileSync, existsSync } from "node:fs"
import { readSession, selectQuestions, createExam } from "./session.ts"
import { answerRomaji, checkRomaji } from "./answer.ts"

const deck = JSON.parse(
	readFileSync(new URL("./deck.json", import.meta.url), "utf8")
)
const ids: string[] = deck.questions.map((q: { id: string }) => q.id)

test("Romaji answers accept kana, punctuation, IME spellings and explicit long vowels", () => {
	for (const input of [
		"karee desu",
		"KARĒ DESU!",
		"カレーです。",
		"かれーです",
		"ｋａｒｅｅ ｄｅｓｕ"
	]) {
		assert.ok(checkRomaji(input, "カレーです。"), input)
	}
	assert.ok(checkRomaji("kōen e ikimasu", "こうえんへ いきます。"))
	assert.ok(checkRomaji("kouen e ikimasu", "こうえんへ いきます。"))
	assert.ok(
		checkRomaji("sitiji ni pan wo tabemasu", "しちじに パンを たべます。")
	)
	assert.ok(checkRomaji("watashi wa fui desu", "わたしは フイです。"))
	assert.equal(answerRomaji("こうえんへ いきます。"), "kouen e ikimasu.")
	assert.equal(answerRomaji("カレーです。"), "karee desu.")
	for (const input of [
		"",
		"...",
		"kare desu",
		"pan desu",
		"karee desu ka",
		"karee deshita"
	]) {
		assert.equal(checkRomaji(input, "カレーです。"), false, input)
	}
	assert.equal(checkRomaji("rokuji ni okimasu", "しちじに おきます。"), false)
	for (const q of deck.questions)
		assert.ok(checkRomaji(answerRomaji(q.answer), q.answer), q.id)
})

test("exam draws exactly two distinct questions from each of the twelve topics", () => {
	const scenes = new Map<string, string>(
		deck.scenes.map((s: { id: string; category: string }) => [s.id, s.category])
	)
	for (let attempt = 0; attempt < 30; attempt++) {
		const exam = createExam(
			deck.questions as { id: string; sceneId: string }[],
			deck.scenes
		)
		assert.equal(exam.length, 24)
		assert.equal(new Set(exam.map((q) => q.id)).size, 24)
		const counts = new Map<string, number>()
		for (const q of exam) {
			const category = scenes.get(q.sceneId)!
			counts.set(category, (counts.get(category) ?? 0) + 1)
		}
		assert.equal(counts.size, 12)
		assert.ok([...counts.values()].every((count) => count === 2))
	}
})

test("every cropped scene has questions and an existing asset; all exercise pages are covered", () => {
	assert.equal(new Set(ids).size, ids.length)
	const pages = new Set(deck.scenes.map((s: { page: number }) => s.page))
	for (const [first, last] of [
		[11, 15],
		[19, 29],
		[33, 36],
		[38, 38],
		[40, 41],
		[45, 57],
		[63, 73],
		[78, 88],
		[90, 96],
		[99, 103],
		[105, 105]
	]) {
		for (let p = first; p <= last; p++)
			assert.ok(pages.has(p), `missing page ${p}`)
	}
	for (const scene of deck.scenes) {
		assert.ok(
			deck.questions.some((q: { sceneId: string }) => q.sceneId === scene.id)
		)
		if (scene.image)
			assert.ok(
				existsSync(new URL(`../../../static${scene.image}`, import.meta.url)),
				scene.image
			)
	}
	for (const q of deck.questions) {
		assert.ok(deck.scenes.some((s: { id: string }) => s.id === q.sceneId))
		assert.ok(q.jp.trim() && q.vi.trim() && q.answer.trim())
	}
})

test("filters preserve all questions for a picture, and separate weak/unseen answers", () => {
	const qs = [
		{ id: "a", sceneId: "one" },
		{ id: "b", sceneId: "one" },
		{ id: "c", sceneId: "two" },
		{ id: "d", sceneId: "one" }
	]
	const ratings = { a: "remembered", b: "review" } as const
	assert.deepEqual(
		selectQuestions(qs, ["one"], ratings, "all").map((q) => q.id),
		["a", "b", "d"]
	)
	assert.deepEqual(
		selectQuestions(qs, ["one"], ratings, "review").map((q) => q.id),
		["b"]
	)
	assert.deepEqual(
		selectQuestions(qs, ["one"], ratings, "unseen").map((q) => q.id),
		["d"]
	)
	assert.deepEqual(selectQuestions(qs, [], ratings, "all"), [])
})

test("resume validates saved progress, handles corrupt storage and a changed deck", () => {
	assert.deepEqual(readSession("broken", ids), {
		ratings: {},
		queue: [],
		index: 0
	})
	assert.deepEqual(readSession(null, ids), { ratings: {}, queue: [], index: 0 })
	const raw = JSON.stringify({
		ratings: { [ids[0]]: "review", removed: "remembered", [ids[1]]: "invalid" },
		queue: [ids[0], ids[1]],
		index: 1
	})
	assert.deepEqual(readSession(raw, ids), {
		ratings: { [ids[0]]: "review" },
		queue: [ids[0], ids[1]],
		index: 1
	})
	assert.deepEqual(
		readSession(JSON.stringify({ queue: ["removed"], index: 9 }), ids).queue,
		[]
	)
	assert.equal(
		readSession(JSON.stringify({ queue: [ids[0]], index: -1 }), ids).index,
		0
	)
})

test("known PDF text-layer collisions and irregular readings use the visible source", () => {
	const answers = (sceneId: string) =>
		deck.questions
			.filter((q: { sceneId: string }) => q.sceneId === sceneId)
			.map((q: { answer: string }) => q.answer)
	assert.ok(answers("p011-1").includes("オリビアさんです。"))
	assert.ok(answers("p011-2").includes("はたちです。"))
	assert.ok(answers("p014-2").includes("さんじゅっさいです。"))
	assert.ok(answers("p056-1").includes("さんびゃくにじゅうはちまんドンです。"))
})
