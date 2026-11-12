<script lang="ts">
	import { mdiChevronRight, mdiAutorenew } from "@mdi/js"
	import Icon from "$/components/MaterialIcon.svelte"
	import { settings } from "$/stores/settings"
	import { getAnswers, isCorrectAnswer } from "$/lib/answer"
	import { vocabPromptAnswersMap } from "$/lib/vocabulary"

	interface Props {
		input?: string
		currentKana?: string
		inputElement?: HTMLInputElement
		onsubmit?: (data: { input: string }) => void
	}

	let {
		input = $bindable(""),
		currentKana = undefined,
		inputElement = $bindable(),
		onsubmit
	}: Props = $props()

	const WHITESPACE = /^\s+$/

	let feedback = $state<{ answer: string; expected: string } | null>(null)
	let composing = false

	$effect(() => {
		currentKana
		feedback = null
	})

	let blocked = false
	let shakeAnimationPlaying = $state(false)

	function handleSubmit() {
		if (composing) return
		if (feedback) {
			const answer = feedback.answer
			feedback = null
			onsubmit?.({ input: answer })
			input = ""
			return
		}
		if (input === "") return

		const isCorrect = currentKana ? isCorrectAnswer(input, currentKana) : false

		if (!isCorrect && currentKana && vocabPromptAnswersMap.has(currentKana)) {
			feedback = { answer: input, expected: getAnswers(currentKana).join(" / ") }
			return
		}

		if (!isCorrect) {
			if (blocked) return
			shakeAnimationPlaying = true

			if ($settings.autoCommit === "strict" && $settings.mistakeDelayMs !== 0) {
				blocked = true
				setTimeout(() => (blocked = false), $settings.mistakeDelayMs)
			}
		}

		onsubmit?.({ input })
		input = ""
	}

	function isCompositionEvent(event: InputEvent) {
		// `event.isComposing` is missing when using a Japanese IME on iOS Safari
		// so we instead check for `event.inputType`
		// https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes
		const composingInputTypes = [
			"insertCompositionText",
			"deleteCompositionText"
		]

		return event.isComposing || composingInputTypes.includes(event.inputType)
	}

	let answers = $derived(currentKana ? getAnswers(currentKana) : [])
	let allowsSpaces = $derived(answers.some((a) => a.includes(" ")))
	let isVietnameseExpected = $derived(
		answers.some((a) =>
			/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/i.test(
				a
			)
		)
	)

	function handleInput(
		event: InputEvent & { currentTarget: EventTarget & HTMLInputElement }
	) {
		if (feedback || composing || isCompositionEvent(event)) return
		// Vietnamese tone-insensitive matches can occur before Telex/VNI finishes the word.
		if (isVietnameseExpected) return
		if (!currentKana) return
		if (event.data === null) return // control key was pressed

		if (!allowsSpaces) {
			input = input.trim()
		}

		if (WHITESPACE.test(event.data) && !allowsSpaces) {
			// space was pressed in single-word mode
			handleSubmit()
			return
		}

		if (
			$settings.autoCommit !== "disabled" &&
			isCorrectAnswer(input, currentKana)
		) {
			handleSubmit()
		} else if (
			$settings.autoCommit === "strict" &&
			!isVietnameseExpected &&
			!answers.some((answer) =>
				answer.toLowerCase().startsWith(input.toLowerCase())
			)
		) {
			handleSubmit()
		}
	}
</script>

<form
	class="answer-input content-width"
	class:shake-animation-playing={shakeAnimationPlaying}
	onsubmit={(e) => {
		e.preventDefault()
		handleSubmit()
	}}
	onanimationend={() => (shakeAnimationPlaying = false)}
>
	<input
		type="text"
		class="text-field"
		bind:value={input}
		readonly={feedback !== null}
		oncompositionstart={() => (composing = true)}
		oncompositionend={() => (composing = false)}
		onkeydown={(event) => {
			if (event.key !== "Enter") return
			event.preventDefault()
			if (!event.isComposing && event.keyCode !== 229 && !event.repeat) handleSubmit()
		}}
		oninput={handleInput as (e: Event) => void}
		placeholder={isVietnameseExpected ? "nhập nghĩa tiếng Việt" : "your answer"}
		lang={isVietnameseExpected ? "vi" : "ja"}
		autocapitalize="none"
		autocomplete="off"
		autocorrect="off"
		spellcheck={false}
		bind:this={inputElement}
	/>
	{#if feedback || isVietnameseExpected || $settings.autoCommit === "disabled"}
		<button type="submit" class="button" title="Submit">
			<Icon size="1em" path={mdiChevronRight} ariaHidden={true} />
		</button>
	{:else}
		<button
			type="button"
			class="button"
			title="Auto submit active. Tap to disable."
			onclick={() => settings.set({ ...$settings, autoCommit: "disabled" })}
		>
			<Icon
				size="0.75em"
				path={mdiAutorenew}
				color="var(--accent-color)"
				ariaHidden={true}
			/>
		</button>
	{/if}
</form>
{#if feedback}
	<p class="content-width" role="status">Đáp án đúng: <strong>{feedback.expected}</strong>. Nhấn Enter để tiếp tục.</p>
{/if}

<style lang="postcss">
	.answer-input {
		display: flex;
		width: 100%;
		position: relative;
		background-color: var(--form-element-background);
		border-bottom: 1px solid var(--background-contrast-light);
		border-radius: 9999px;
		margin: 0 auto;
		font-size: 1.4em;
	}

	.text-field {
		margin: 0;
		width: 100%;
		text-align: center;
		height: 2.5em;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font-family: inherit;
		font-size: inherit;

		&:focus {
			outline: none;
		}
		&::placeholder {
			color: var(--text-color-light);
		}
	}

	.button {
		color: inherit;
		background: none;
		margin: 0;
		border: 0;
		padding: 0;
		font-size: 1.75em;
		width: 1.5em;
		height: 100%;

		position: absolute;
		right: 0;

		/* center content */
		display: flex;
		align-items: center;
		justify-content: center;

		&:focus-visible {
			outline: var(--focus-color) solid 3px;
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20%,
		60% {
			transform: translateX(-10px);
		}
		40%,
		80% {
			transform: translateX(10px);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.shake-animation-playing {
			animation-name: shake;
			animation-duration: 300ms;
		}
	}
</style>
