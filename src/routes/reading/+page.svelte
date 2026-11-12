<script lang="ts">
	import Input from "$/routes/session/Input.svelte"
	import QuizItem from "$/routes/session/QuizItem.svelte"
	import { passageTokens, readingPassages, type ReadingToken } from "$/lib/reading"
	import {
		loadErrorSound,
		loadHiraganaSound,
		loadProgressSound,
		playErrorSound,
		playKanaSound,
		playProgressSound
	} from "$/lib/sound"
	import { onMount } from "svelte"

	type ReadingQuestion = {
	passageTitle: string
	token: ReadingToken
}

	function initialQueue(): ReadingQuestion[] {
		return readingPassages.flatMap((passage) =>
			passageTokens(passage)
				.filter((token) => !token.separator)
				.map((token) => ({ passageTitle: passage.title, token }))
		)
	}

	let queue = $state(initialQueue())
	let index = $state(0)
	let input = $state("")
	let inputElement: HTMLInputElement | undefined = $state()
	let attempts = $state(0)
	let correctAnswers = $state(0)
	let streakLength = 0
	let feedback = $state<{ correct: boolean; expected: string } | null>(null)
	let feedbackKey = $state(0)

	let current = $derived(queue[index])
	let finished = $derived(index >= queue.length)

	function normalize(value: string) {
		return value
			.normalize("NFKC")
			.toLowerCase()
			.replace(/ō/g, "ou")
			.replace(/ū/g, "uu")
			.replace(/[^a-z0-9]/g, "")
	}

	function submit({ input: answer }: { input: string }) {
		if (!current) return

		const isCorrect = normalize(answer) === normalize(current.token.expected)
		feedback = { correct: isCorrect, expected: current.token.expected }
		feedbackKey += 1
		attempts += 1
		if (isCorrect) {
			playProgressSound(streakLength)
			correctAnswers += 1
			streakLength += 1
		} else {
			playErrorSound()
			streakLength = 0
			queue = [...queue, current]
		}
		playKanaSound(current.token.display)
		index += 1
	}

	function restart() {
		queue = initialQueue()
		index = 0
		input = ""
		attempts = 0
		correctAnswers = 0
		streakLength = 0
		feedback = null
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.isComposing || event.key === " ") return
		if (event.key.length === 1 && document.activeElement !== inputElement) {
			inputElement?.focus()
		}
	}

	onMount(() => {
		loadProgressSound()
		loadErrorSound()
		loadHiraganaSound()
		inputElement?.focus()
	})
</script>

<svelte:head>
	<title>Luyện đọc Romaji · Type Kana</title>
	<meta name="description" content="Luyện đọc từng cụm tiếng Nhật bằng cách nhập Romaji." />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<section class="reading-page content-padding">
	<div class="reading-shell content-width center">
		<a class="text-link" href="/">← Trang chủ</a>
		<header>
			<div>
				<h1>Luyện đọc Romaji</h1>
				<p>Nhập cách đọc Romaji cho từng cụm tiếng Nhật.</p>
			</div>
			{#if !finished}<span class="progress">Cụm {index + 1}/{queue.length}</span>{/if}
		</header>

		{#if finished}
			<section class="result" aria-live="polite">
				<h2>Hoàn thành</h2>
				<p>Đúng {correctAnswers}/{attempts} lượt chấm.</p>
				<button type="button" onclick={restart}>Luyện lại</button>
			</section>
		{:else}
			<article class="passage" aria-labelledby="passage-title">
				<h2 id="passage-title">{current.passageTitle}</h2>
				<QuizItem kana={current.token.display} isCurrent={true} />
			</article>

			<Input
				bind:input
				bind:inputElement
				currentKana={current.token.expected}
				onsubmit={submit}
			/>
			{#if feedback}
				{#key feedbackKey}
					<div
						class="feedback"
						class:correct={feedback.correct}
						class:incorrect={!feedback.correct}
						role="status"
					>
						{#if feedback.correct}
							<strong>✓ Chính xác</strong>
						{:else}
							<strong>✗ Chưa đúng</strong>
							<span>Đáp án đúng: {feedback.expected}</span>
						{/if}
					</div>
				{/key}
			{/if}
		{/if}
	</div>
</section>

<style>
	.reading-shell {
		max-width: 52rem;
		padding-top: 1.5rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 1rem;
		margin: 2rem 0 1.5rem;
	}
	h1 {
		margin: 0 0 0.4rem;
	}
	header p {
		margin: 0;
	}
	.progress {
		white-space: nowrap;
		color: var(--text-color-light);
	}
	.passage {
		padding: 1.5rem;
		border: 1px solid var(--background-contrast-light);
		border-radius: var(--standard-border-radius);
		background: var(--background-contrast);
		margin-bottom: 1.5rem;
		text-align: center;
	}
	.passage h2 {
		font-size: 1rem;
		margin: 0;
		text-align: left;
	}
	.result {
		padding: 2rem 0;
	}
	.feedback {
		margin: 1rem auto 0;
		padding: 0.8rem 1rem;
		border-left: 4px solid var(--text-color-light);
		text-align: center;
		animation: feedback-in 180ms ease-out;
	}
	.feedback.correct {
		border-color: #16803d;
		color: #16803d;
	}
	.feedback.incorrect {
		border-color: var(--highlight-color);
	}
	.feedback span {
		display: block;
		margin-top: 0.25rem;
		font-family: "M+ 2c", sans-serif;
	}
	@keyframes feedback-in {
		from {
			opacity: 0;
			transform: translateY(-0.4rem) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	@media (max-width: 36em) {
		header {
			align-items: start;
			flex-direction: column;
		}
	}
</style>
