import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import vm from "node:vm"
import ts from "typescript"

const source = readFileSync(new URL("./Input.svelte", import.meta.url), "utf8")
function harness() {
	const submitted = []
	const context = vm.createContext({
		input: "sai", currentKana: "word", feedback: null, composing: false,
		blocked: false, shakeAnimationPlaying: false,
		vocabPromptAnswersMap: new Map([["word", ["cá"]]]),
		getAnswers: () => ["cá"], isCorrectAnswer: (value) => value === "ca" || value === "cá",
		onsubmit: (value) => submitted.push(value.input),
		$settings: { autoCommit: "strict", mistakeDelayMs: 0 },
		isVietnameseExpected: true, allowsSpaces: false, answers: ["cá"],
		WHITESPACE: /^\s+$/
	})
	for (const [start, end] of [
		["function handleSubmit()", "function isCompositionEvent"],
		["function isCompositionEvent", "let answers ="],
		["function handleInput(", "</script>"]
	]) {
		const code = source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)))
		vm.runInContext(ts.transpile(code, { target: ts.ScriptTarget.ES2022 }), context)
	}
	return { context, submitted }
}

test("wrong vocabulary waits for confirmation and submits the original answer once", () => {
	const { context, submitted } = harness()
	context.handleSubmit()
	assert.equal(context.feedback.expected, "cá")
	assert.deepEqual(submitted, [])
	context.handleInput({ data: "x", isComposing: false, inputType: "insertText" })
	assert.deepEqual(submitted, [])
	context.handleSubmit()
	assert.deepEqual(submitted, ["sai"])
	assert.equal(context.feedback, null)
	assert.equal(context.input, "")
	context.handleSubmit()
	assert.equal(submitted.length, 1)
})

test("Vietnamese waits for Enter even when an unfinished word matches without tones", () => {
	const { context, submitted } = harness()
	context.input = "ca"
	context.handleInput({ data: "a", isComposing: false, inputType: "insertText" })
	assert.deepEqual(submitted, [])
	context.composing = true
	context.handleSubmit()
	assert.deepEqual(submitted, [])
	context.composing = false
	context.input = "cá"
	context.handleSubmit()
	assert.deepEqual(submitted, ["cá"])
})

test("kana still auto submits correct answers", () => {
	const { context, submitted } = harness()
	context.isVietnameseExpected = false
	context.currentKana = "kana"
	context.input = "ca"
	context.handleInput({ data: "a", isComposing: false, inputType: "insertText" })
	assert.deepEqual(submitted, ["ca"])
})
