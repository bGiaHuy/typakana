import assert from "node:assert/strict"
import { test } from "node:test"
import { readFileSync, existsSync } from "node:fs"
import { readSession, selectQuestions } from "./session.ts"

const deck = JSON.parse(
	readFileSync(new URL("./deck.json", import.meta.url), "utf8")
)
const ids: string[] = deck.questions.map((q: { id: string }) => q.id)

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
