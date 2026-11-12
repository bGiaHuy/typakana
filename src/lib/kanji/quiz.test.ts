import { test } from "node:test"
import assert from "node:assert/strict"
import { vocabulary, selectVocabulary, selectLessons } from "./vocabulary.ts"
import {
	createQuiz,
	changeMode,
	changeGroup,
	updateAnswer,
	submitQuiz,
	gradeItem,
	gradeMeaning,
	gradeQuiz,
	scoreQuiz,
	incorrectItems
} from "./quiz.ts"

test("meaning language accepts every configured answer independently of readings", () => {
	for (const item of vocabulary) {
		for (const language of ["english", "vietnamese"] as const) {
			const meanings = [...item.englishMeanings, ...item.acceptedMeanings]
			assert.ok(meanings.length)
			for (const meaning of meanings) {
				assert.equal(gradeMeaning(item, ` ${meaning.toUpperCase()} `, language), true)
			}
			assert.equal(gradeMeaning(item, "", language), false)
			assert.equal(gradeMeaning(item, "definitely not a valid meaning", language), false)
			assert.equal(gradeItem(item, { pronunciation: "", meaning: item.englishMeanings[0] }, "hiragana").meaning, true)
			const grade = gradeQuiz([item], { [item.id]: { pronunciation: "wrong", meaning: meanings[0] } }, "hiragana", language)
			assert.deepEqual(grade[item.id], { pronunciation: false, meaning: true })
		}
	}
})

test("46 unique items and exact group sizes, each with both solutions", () => {
	assert.equal(vocabulary.length, 46)
	assert.equal(new Set(vocabulary.map((item) => item.id)).size, 46)
	for (const [group, count] of [
		["all", 46],
		["original", 20],
		["new", 12]
	] as const)
		assert.equal(selectVocabulary(group).length, count)
	for (const item of vocabulary) {
		assert.ok(
			item.hiragana.length && item.romaji.length && item.acceptedMeanings.length
		)
		assert.deepEqual(
			gradeItem(
				item,
				{ pronunciation: item.hiragana[0], meaning: item.meaning },
				"hiragana"
			),
			{ pronunciation: true, meaning: true }
		)
		assert.equal(
			gradeItem(item, { pronunciation: item.romaji[0], meaning: "" }, "romaji")
				.pronunciation,
			true
		)
	}
})
test("readings normalize Unicode, spaces and explicit long vowels without fuzzy matching", () => {
	const school = vocabulary.find((item) => item.kanji === "学校")!
	for (const pronunciation of ["gakkou", " GAKKŌ ", "ｇａｋｋｏｕ"])
		assert.equal(
			gradeItem(school, { pronunciation, meaning: "" }, "romaji").pronunciation,
			true
		)
	for (const pronunciation of ["gakou", "gakko", "gakk o u", ""])
		assert.equal(
			gradeItem(school, { pronunciation, meaning: "" }, "romaji").pronunciation,
			false
		)
	assert.equal(
		gradeItem(
			school,
			{ pronunciation: " か\u3099っこう ", meaning: "" },
			"hiragana"
		).pronunciation,
		true
	)
	assert.equal(
		gradeItem(school, { pronunciation: "がこう", meaning: "" }, "hiragana")
			.pronunciation,
		false
	)
	const what = vocabulary.find((item) => item.kanji === "何")!
	for (const pronunciation of ["なん", "なに"])
		assert.equal(
			gradeItem(what, { pronunciation, meaning: "" }, "hiragana").pronunciation,
			true
		)
	for (const pronunciation of ["nan", "nani"])
		assert.equal(
			gradeItem(what, { pronunciation, meaning: "" }, "romaji").pronunciation,
			true
		)
})
test("Vietnamese synonyms, numbers, case, spacing and Unicode", () => {
	const monday = vocabulary.find((item) => item.kanji === "月曜日")!
	for (const meaning of ["thứ hai", " THỨ   2 ", "thứ hai".normalize("NFD")])
		assert.equal(
			gradeItem(monday, { pronunciation: "", meaning }, "hiragana").meaning,
			true
		)
	const student = vocabulary.find((item) => item.kanji === "学生")!
	for (const meaning of ["học sinh", "sinh viên"])
		assert.equal(
			gradeItem(student, { pronunciation: "", meaning }, "hiragana").meaning,
			true
		)
	assert.equal(
		gradeItem(student, { pronunciation: "", meaning: "giáo viên" }, "hiragana")
			.meaning,
		false
	)
})
test("empty, partial and full credit for all groups", () => {
	for (const group of ["all", "original", "new"] as const) {
		const items = selectVocabulary(group)
		assert.equal(scoreQuiz(items, gradeQuiz(items, {}, "hiragana")).score, 0)
		const answers = Object.fromEntries(
			items.map((item) => [
				item.id,
				{ pronunciation: item.hiragana[0], meaning: item.meaning }
			])
		)
		assert.deepEqual(scoreQuiz(items, gradeQuiz(items, answers, "hiragana")), {
			score: items.length * 2,
			maximum: items.length * 2,
			incorrect: 0
		})
		answers[items[0].id].meaning = ""
		assert.equal(
			scoreQuiz(items, gradeQuiz(items, answers, "hiragana")).score,
			items.length * 2 - 1
		)
	}
})
test("independent inputs, mode clears readings only, group preserves answers", () => {
	let state = updateAnswer(createQuiz(), "original-1", "meaning", "trăng")
	state = updateAnswer(state, "original-1", "pronunciation", "つき")
	const answers = structuredClone(state.answers)
	state = changeGroup(changeGroup(state, "new"), "original")
	assert.deepEqual(state.answers, answers)
	state = submitQuiz(state)
	state.revealed = true
	state.incorrectOnly = true
	state = changeMode(state, "romaji")
	assert.deepEqual(state.answers["original-1"], {
		pronunciation: "",
		meaning: "trăng"
	})
	assert.equal(state.grades, null)
	assert.equal(state.revealed, false)
	assert.equal(state.incorrectOnly, false)
})
test("incorrect-only, revealing, editing and reset", () => {
	let state = updateAnswer(
		createQuiz("new", "romaji"),
		"new-1",
		"pronunciation",
		"watashi"
	)
	state = updateAnswer(state, "new-1", "meaning", "tôi")
	state = submitQuiz(state)
	assert.equal(
		incorrectItems(selectVocabulary("new"), state.grades!).length,
		11
	)
	const answers = structuredClone(state.answers)
	state.revealed = true
	assert.deepEqual(state.answers, answers)
	state = updateAnswer(state, "new-1", "meaning", "sai")
	assert.equal(state.grades, null)
	state = createQuiz(state.group, state.mode)
	assert.deepEqual(state, {
		group: "new",
		mode: "romaji",
		answers: {},
		grades: null,
		revealed: false,
		incorrectOnly: false
	})
})

test("lesson selection has 12, 14, 20 items without duplicates", () => {
	for (const [id, count] of [
		[1, 12],
		[2, 14],
		[3, 20]
	])
		assert.equal(selectLessons([id]).length, count)
	assert.equal(selectLessons([]).length, 0)
	assert.equal(selectLessons([1, 2, 3]).length, 46)
	assert.equal(selectLessons([2, 2]).length, 14)
	const items = selectLessons([2])
	assert.equal(scoreQuiz(items, gradeQuiz(items, {}, "hiragana")).maximum, 28)
})
