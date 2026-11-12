<script lang="ts">
	import type { Lesson } from "$/lib/vocabulary"
	import { gameConfig } from "$/stores/game-config"
	import Checkbox from "$/components/Checkbox.svelte"
	import { playCheckboxSelectSeriesSound } from "$/lib/sound"

	interface Props {
		lesson: Lesson
	}

	let { lesson }: Props = $props()

	let expandedSubLessons: Record<string, boolean> = $state({})

	function toggleExpand(subId: string) {
		expandedSubLessons[subId] = !expandedSubLessons[subId]
	}

	let lessonSubIds = $derived(lesson.subLessons.map((s) => s.id))
	let selectedSubs = $derived($gameConfig.selectedSubLessons ?? [])

	let isAllSelected = $derived(
		lessonSubIds.length > 0 &&
			lessonSubIds.every((id) => selectedSubs.includes(id))
	)

	let isIndeterminate = $derived(
		!isAllSelected && lessonSubIds.some((id) => selectedSubs.includes(id))
	)

	let totalWords = $derived(
		lesson.subLessons.reduce((acc, sub) => acc + sub.items.length, 0)
	)

	let selectedWords = $derived(
		lesson.subLessons.reduce((acc, sub) => {
			if (selectedSubs.includes(sub.id)) {
				return acc + sub.items.length
			}
			return acc
		}, 0)
	)

	function toggleLesson() {
		const willSelectAll = !isAllSelected
		let current = [...selectedSubs]

		if (willSelectAll) {
			for (const id of lessonSubIds) {
				if (!current.includes(id)) current.push(id)
			}
		} else {
			current = current.filter((id) => !lessonSubIds.includes(id))
		}

		gameConfig.update((cfg) => ({ ...cfg, selectedSubLessons: current }))
		playCheckboxSelectSeriesSound(6, willSelectAll)
	}

	function toggleSubLesson(subId: string) {
		let current = [...selectedSubs]
		const isCurrentlySelected = current.includes(subId)

		if (isCurrentlySelected) {
			current = current.filter((id) => id !== subId)
		} else {
			current.push(subId)
		}

		gameConfig.update((cfg) => ({ ...cfg, selectedSubLessons: current }))
		playCheckboxSelectSeriesSound(3, !isCurrentlySelected)
	}
</script>

<div class="lesson-card">
	<div class="lesson-header">
		<label class="lesson-title-label">
			<Checkbox
				checked={isAllSelected}
				indeterminate={isIndeterminate}
				onclick={toggleLesson}
			/>
			<div class="header-info">
				<div class="title-row">
					<h2 class="lesson-title">{lesson.title}</h2>
					<span class="word-counter">
						{selectedWords}/{totalWords} từ
					</span>
				</div>
				<p class="lesson-desc">{lesson.description}</p>
			</div>
		</label>
	</div>

	<div class="sublessons-list">
		{#each lesson.subLessons as sub (sub.id)}
			{@const isSubChecked = selectedSubs.includes(sub.id)}
			<div class="sublesson-item" class:is-checked={isSubChecked}>
				<div class="sublesson-main">
					<label class="sublesson-label">
						<Checkbox
							checked={isSubChecked}
							onclick={() => toggleSubLesson(sub.id)}
						/>
						<div class="sublesson-text">
							<span class="sublesson-name">{sub.title}</span>
							<span class="sublesson-meta">
								{sub.description} · ({sub.items.length} từ)
							</span>
						</div>
					</label>
					<button
						type="button"
						class="expand-btn"
						onclick={() => toggleExpand(sub.id)}
						title="Xem danh sách từ"
					>
						{expandedSubLessons[sub.id] ? "Thu gọn ▲" : "Chi tiết ▼"}
					</button>
				</div>

				{#if expandedSubLessons[sub.id]}
					<div class="words-preview">
						{#each sub.items as item (item.id)}
							<div class="word-chip">
								<span class="chip-jp">{item.display}</span>
								<span class="chip-vi">{item.vietnamese}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
	.lesson-card {
		background: var(--surface-2, rgba(255, 255, 255, 0.03));
		border: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.08));
		border-radius: var(--standard-border-radius, 12px);
		padding: 1.5em;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 1.25em;
		width: 100%;
		max-width: 680px;
	}

	.lesson-header {
		padding-bottom: 1em;
		border-bottom: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.08));
	}

	.lesson-title-label {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		cursor: pointer;
		user-select: none;
	}

	.header-info {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		gap: 0.2em;
	}

	.title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.lesson-title {
		margin: 0;
		font-size: 1.35em;
		font-weight: 700;
		color: var(--text-color);
	}

	.word-counter {
		font-size: 0.85em;
		font-weight: 600;
		background: var(--form-element-background, rgba(255, 255, 255, 0.08));
		padding: 0.25em 0.75em;
		border-radius: 9999px;
		color: var(--text-color-light);
	}

	.lesson-desc {
		margin: 0;
		font-size: 0.9em;
		color: var(--text-color-light);
		opacity: 0.85;
	}

	.sublessons-list {
		display: flex;
		flex-direction: column;
		gap: 0.75em;
	}

	.sublesson-item {
		background: var(--surface-1, rgba(255, 255, 255, 0.02));
		border: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.06));
		border-radius: 8px;
		padding: 0.75em 1em;
		transition: all 120ms ease;

		&.is-checked {
			border-color: rgba(37, 99, 235, 0.35);
			background: rgba(37, 99, 235, 0.05);
		}
	}

	.sublesson-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75em;
	}

	.sublesson-label {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		user-select: none;
		flex-grow: 1;
	}

	.sublesson-text {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
	}

	.sublesson-name {
		font-size: 1.05em;
		font-weight: 600;
		color: var(--text-color);
	}

	.sublesson-meta {
		font-size: 0.8em;
		color: var(--text-color-light);
		opacity: 0.8;
	}

	.expand-btn {
		background: none;
		border: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.12));
		border-radius: 6px;
		color: var(--text-color-light);
		padding: 0.3em 0.6em;
		font-size: 0.8em;
		font-family: inherit;
		cursor: pointer;
		white-space: nowrap;
		transition: all 100ms ease;

		&:hover {
			color: var(--text-color);
			background: var(--form-element-background, rgba(255, 255, 255, 0.06));
		}
	}

	.words-preview {
		margin-top: 0.75em;
		padding-top: 0.75em;
		border-top: 1px dashed
			var(--background-contrast-light, rgba(255, 255, 255, 0.08));
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		max-height: 220px;
		overflow-y: auto;
	}

	.word-chip {
		background: var(--surface-2, rgba(255, 255, 255, 0.05));
		border: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.08));
		border-radius: 6px;
		padding: 0.25em 0.55em;
		font-size: 0.82em;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.chip-jp {
		font-weight: 600;
		color: var(--text-color);
	}

	.chip-vi {
		color: var(--text-color-light);
		opacity: 0.85;
	}
</style>
