<script lang="ts">
	import QuizItemComponent from "./QuizItem.svelte"
	import type { QuizItem } from "$/stores/quiz"
	import { getAnswers } from "$/lib/answer"
	import { settings } from "$/stores/settings"
	import Icon from "$/components/MaterialIcon.svelte"
	import { mdiClose as errorMarkerIcon } from "@mdi/js"

	interface Props {
		unquizzed: QuizItem[]
		input?: string
		lastQuizzedElement?: HTMLDivElement
	}

	let {
		unquizzed,
		input = "",
		lastQuizzedElement = $bindable()
	}: Props = $props()

	function showErrorMarker(kana?: string, input?: string): boolean {
		if (
			$settings.showErrorMarker &&
			kana &&
			input &&
			input.length > 0 &&
			$settings.autoCommit !== "strict"
		) {
			return !getAnswers(kana).some((answer) => answer.startsWith(input!))
		} else {
			return false
		}
	}
	let currentItem = $derived(unquizzed[0])
	let errorMarkerVisible = $derived(showErrorMarker(currentItem?.kana, input))
</script>

<section class="quiz">
	<div class="current-kana">
		{#if currentItem}
			<QuizItemComponent
				kana={currentItem.kana}
				assignedFont={currentItem.assignedFont}
				isCurrent={true}
				bind:element={lastQuizzedElement}
			/>
		{/if}
	</div>
	<div
		class="error-marker"
		class:visible={errorMarkerVisible}
		aria-hidden={!errorMarkerVisible}
	>
		<Icon path={errorMarkerIcon} />
	</div>
</section>

<style lang="postcss">
	.quiz {
		display: flex;
		justify-content: center;
		padding: 2em 1em 3em;
		position: relative;
	}
	.current-kana {
		position: relative;
		min-width: 0;
		max-width: 100%;
	}

	.error-marker {
		display: flex;
		position: absolute;
		left: 50%;
		bottom: 0.5em;
		transform: translate(-50%, 0);
		color: var(--highlight-color);
		font-size: 1.75em;
		opacity: 0;
		transition: 150ms var(--standard-curve) opacity;

		&.visible {
			opacity: 1;
		}
	}
</style>
