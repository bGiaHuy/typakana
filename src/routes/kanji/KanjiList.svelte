<script lang="ts">
	import { untrack } from "svelte"
	import Button from "$/components/Button.svelte"
	import KanjiRow from "./KanjiRow.svelte"
	import { shuffleArray } from "$/lib/random"
	import {
		type KanjiItem,
		type MeaningLanguage,
		type PronunciationMode
	} from "$/lib/kanji/vocabulary"
	import {
		createQuiz,
		changeMode,
		updateAnswer,
		gradeQuiz,
		scoreQuiz,
		incorrectItems
	} from "$/lib/kanji/quiz"
	let {
		vocabulary,
		initialMode = "hiragana",
		initialMeaningLanguage = "vietnamese"
	}: { vocabulary: KanjiItem[]; initialMode?: PronunciationMode; initialMeaningLanguage?: MeaningLanguage } = $props()
	let quiz = $state(untrack(() => createQuiz("all", initialMode)))
	let meaningLanguage = $state<MeaningLanguage>(untrack(() => initialMeaningLanguage))
	let orderedVocabulary = $state(untrack(() => [...vocabulary]))
	let items = $derived(orderedVocabulary)
	function shuffleWords() {
		orderedVocabulary = shuffleArray(items)
	}
	let visible = $derived(
		quiz.incorrectOnly && quiz.grades
			? incorrectItems(items, quiz.grades)
			: items
	)
	let completed = $derived(
		items.filter(
			(item) =>
				quiz.answers[item.id]?.pronunciation.trim() &&
				quiz.answers[item.id]?.meaning.trim()
		).length
	)
	let result = $derived(quiz.grades ? scoreQuiz(items, quiz.grades) : null)
</script>

<svelte:head>
	<title>Luyện Kanji · Type Kana</title>
	<meta
		name="description"
		content="Luyện cách đọc Hiragana, Romaji và nghĩa tiếng Việt của các từ Kanji."
	/>
</svelte:head>
<section class="content-padding">
	<div class="practice center">
		<header>
			<div>
				<h1>Luyện Kanji</h1>
				<p>Nhìn Kanji, nhập cách đọc và nghĩa tiếng Việt.</p>
			</div>
			<span>Đã điền {completed}/{items.length} từ</span>
		</header>
		<div class="configuration">
			<fieldset>
				<legend>Cách đọc</legend>
				<div class="segments">
					{#each ["hiragana", "romaji"] as mode (mode)}<button
							type="button"
							aria-pressed={quiz.mode === mode}
							onclick={() =>
								(quiz = changeMode(quiz, mode as PronunciationMode))}
						>
							{mode === "hiragana" ? "Hiragana" : "Romaji"}
						</button>{/each}
				</div>
			</fieldset>
			<Button style="outline" onclick={shuffleWords}>Đảo thứ tự</Button>
		</div>
		{#if result}
			<section class="result" aria-label="Kết quả bài làm">
				<p role="status">
					<strong>{result.score}/{result.maximum} điểm</strong>
					· {result.score} ô đúng · {result.incorrect} ô sai hoặc chưa trả lời
				</p>
				<progress
					aria-label="Tỷ lệ điểm đạt được"
					value={result.score}
					max={result.maximum}
				></progress>
				<div class="result-options">
					<label>
						<input type="checkbox" bind:checked={quiz.incorrectOnly} />
						Chỉ hiện từ có câu sai
					</label>
					<label>
						<input type="checkbox" bind:checked={quiz.revealed} />
						Hiện đáp án đúng
					</label>
				</div>
			</section>
		{/if}
		<form
			onsubmit={(event) => {
				event.preventDefault()
				quiz = { ...quiz, grades: gradeQuiz(items, quiz.answers, quiz.mode, meaningLanguage) }
			}}
		>
			<div class="column-head" aria-hidden="true">
				<span>Kanji</span>
				<span>
					Cách đọc ({quiz.mode === "hiragana" ? "Hiragana" : "Romaji"})
				</span>
				<span>Nghĩa ({meaningLanguage === "english" ? "English" : "Tiếng Việt"})</span>
			</div>
			{#each visible as item (item.id)}<KanjiRow
					{item}
					answer={quiz.answers[item.id]}
					grade={quiz.grades?.[item.id]}
					mode={quiz.mode}
					meaningLanguage={meaningLanguage}
					revealed={quiz.revealed}
					onchange={(field, value) =>
						(quiz = updateAnswer(quiz, item.id, field, value))}
				/>{/each}
			{#if visible.length === 0}<p class="empty">
					Tất cả câu trả lời đều đúng. Bạn đã hoàn thành nhóm từ này!
				</p>{/if}
			<div class="actions">
				<Button
					style="outline"
					onclick={() => (quiz = createQuiz(quiz.group, quiz.mode))}
				>
					Làm lại
				</Button><Button type="submit">Chấm bài</Button>
			</div>
		</form>
		{#if items.some((item) => item.note)}<aside>
				<strong>Lưu ý dữ liệu:</strong>
				{items.find((item) => item.note)?.note}
			</aside>{/if}
	</div>
</section>

<style>
	.practice {
		max-width: 58rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 2rem;
	}
	h1 {
		margin-bottom: 0.5rem;
	}
	header > span {
		font-size: 0.9rem;
		padding-top: 0.5rem;
	}
	.configuration {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: end;
		padding: 1.2rem;
		background: var(--background-contrast);
		border-radius: var(--standard-border-radius);
		margin-bottom: 1.5rem;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}
	legend {
		margin-bottom: 0.4rem;
	}
	.segments {
		display: flex;
		gap: 0.25rem;
	}
	.segments button {
		min-height: 2.8rem;
		padding: 0.6rem 1rem;
		font: inherit;
		border: 1px solid var(--text-color-light);
		background: var(--form-element-background);
		color: var(--text-color);
		border-radius: 0.4rem;
		cursor: pointer;
	}
	.segments button[aria-pressed="true"] {
		background: var(--accent-color);
		color: var(--text-color-on-accent-color);
		border-color: var(--accent-color);
	}
	.column-head {
		display: grid;
		grid-template-columns: 0.65fr 1fr 1fr;
		gap: 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		border-bottom: 2px solid var(--text-color-lighter);
		padding-bottom: 0.75rem;
	}
	.result {
		margin-bottom: 1.5rem;
	}
	.result p {
		margin-bottom: 0.5rem;
	}
	progress {
		width: 100%;
		height: 0.8rem;
		accent-color: var(--accent-color);
	}
	.result-options {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 0.75rem;
	}
	.actions {
		display: flex;
		justify-content: end;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin: 1.5rem 0;
	}
	aside {
		font-size: 0.85rem;
		line-height: 1.6;
		padding: 1rem;
		border-left: 3px solid var(--accent-color);
	}
	.empty {
		padding: 1.5rem 0;
	}
	@media (max-width: 36em) {
		.column-head {
			display: none;
		}
	}
</style>
