<script lang="ts">
	import Column from "./Column.svelte"
	import NumberColumn from "./NumberColumn.svelte"
	import VocabLessonCard from "./VocabLessonCard.svelte"
	import { gameConfig } from "$/stores/game-config"
	import Radio from "$/components/Radio.svelte"
	import Checkbox from "$/components/Checkbox.svelte"
	import Button from "$/components/Button.svelte"
	import Icon from "$/components/MaterialIcon.svelte"
	import { mdiArrowRight, mdiArrowLeft, mdiShuffle } from "@mdi/js"
	import { dictionary } from "$/stores/dictionary"
	import { lessonsData } from "$/lib/vocabulary"
	import { onMount } from "svelte"
	import { goto } from "$app/navigation"
	import {
		loadCheckboxSelectSound,
		loadDropSound,
		playDropSound,
		playCheckboxSelectSeriesSound
	} from "$/lib/sound"
	import { quiz } from "$/stores/quiz"
	import { browser } from "$app/environment"
	import MenuBar from "$/components/MenuBar.svelte"

	interface Props {
		data: { mode: "numbers" | "vocab" | "kana" | null }
	}

	let { data }: Props = $props()

	if (data.mode) {
		gameConfig.update((cfg) => ({ ...cfg, practiceMode: data.mode! }))
	}

	$effect.pre(() => {
		if (data.mode) {
			gameConfig.update((cfg) => ({ ...cfg, practiceMode: data.mode! }))
		}
	})

	onMount(() => {
		if (browser) {
			loadCheckboxSelectSound()
			loadDropSound()
		}
	})

	function selectAllLessons() {
		const allSubIds = lessonsData.flatMap((l) => l.subLessons.map((s) => s.id))
		gameConfig.update((cfg) => ({ ...cfg, selectedSubLessons: allSubIds }))
		playCheckboxSelectSeriesSound(6, true)
	}

	function selectOnlyLesson(lessonId: string) {
		const targetLesson = lessonsData.find((l) => l.id === lessonId)
		if (!targetLesson) return
		const subIds = targetLesson.subLessons.map((s) => s.id)
		gameConfig.update((cfg) => ({ ...cfg, selectedSubLessons: subIds }))
		playCheckboxSelectSeriesSound(4, true)
	}

	function clearAllLessons() {
		gameConfig.update((cfg) => ({ ...cfg, selectedSubLessons: [] }))
		playCheckboxSelectSeriesSound(4, false)
	}

	let activeMode = $derived(
		!browser && data.mode ? data.mode : $gameConfig.practiceMode
	)
</script>

<svelte:head>
	<title>Setup · Type Kana</title>
</svelte:head>

<div class="wrapper">
	<div class="mode-switcher-container">
		<div class="mode-switcher" role="tablist" aria-label="Practice Mode">
			<button
				type="button"
				role="tab"
				aria-selected={$gameConfig.practiceMode === "kana"}
				class="mode-btn"
				class:active={$gameConfig.practiceMode === "kana"}
				onclick={() =>
					gameConfig.update((cfg) => ({ ...cfg, practiceMode: "kana" }))}
			>
				Kana (かな)
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={$gameConfig.practiceMode === "numbers"}
				class="mode-btn"
				class:active={$gameConfig.practiceMode === "numbers"}
				onclick={() =>
					gameConfig.update((cfg) => ({ ...cfg, practiceMode: "numbers" }))}
			>
				Numbers (数 / Số đếm)
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={$gameConfig.practiceMode === "vocab"}
				class="mode-btn"
				class:active={$gameConfig.practiceMode === "vocab"}
				onclick={() =>
					gameConfig.update((cfg) => ({ ...cfg, practiceMode: "vocab" }))}
			>
				Vocabulary (Từ vựng)
			</button>
		</div>
	</div>

	{#if activeMode === "kana"}
		<fieldset class="practice-type">
			<legend>I want to practice...</legend>
			<div class="radio-buttons">
				<Radio
					id="kana-type-hiragana-choice"
					name="kana-type"
					bind:group={$gameConfig.kanaType}
					value="hiragana"
				>
					Hiragana
				</Radio>
				<Radio
					id="kana-type-katakana-choice"
					name="kana-type"
					bind:group={$gameConfig.kanaType}
					value="katakana"
				>
					Katakana
				</Radio>
				<Radio
					id="kana-type-both-choice"
					name="kana-type"
					bind:group={$gameConfig.kanaType}
					value="both"
				>
					Both
				</Radio>
			</div>
		</fieldset>
		<section class="columns">
			<Column bind:rows={$gameConfig.gojuon} label="Gojūon" />
			<Column bind:rows={$gameConfig.dakuon} label="Dakuon" />
			<Column bind:rows={$gameConfig.yoon} label="Yōon" />
			<Column bind:rows={$gameConfig.dakuonYoon} label="Dakuon Yōon" />
		</section>
	{:else if activeMode === "numbers"}
		<fieldset class="practice-type">
			<legend>Display numbers as...</legend>
			<div class="radio-buttons">
				<Radio
					id="number-display-kanji"
					name="number-display"
					bind:group={$gameConfig.numberDisplay}
					value="kanji"
				>
					Kanji (一, 二, 三)
				</Radio>
				<Radio
					id="number-display-arabic"
					name="number-display"
					bind:group={$gameConfig.numberDisplay}
					value="arabic"
				>
					Arabic (1, 2, 3)
				</Radio>
				<Radio
					id="number-display-both"
					name="number-display"
					bind:group={$gameConfig.numberDisplay}
					value="both"
				>
					Both (Cả hai)
				</Radio>
			</div>
		</fieldset>
		<section class="number-columns">
			<NumberColumn
				bind:rows={$gameConfig.numbersBasic}
				label="Basic (0 – 10)"
				description="Số đếm cơ bản 0 - 10"
			/>
			<NumberColumn
				bind:rows={$gameConfig.numbersTens}
				label="Tens & Large Numbers"
				description="11-20 & Hàng chục, trăm, nghìn"
			/>
			<NumberColumn
				bind:rows={$gameConfig.numbersObjects}
				label="General Objects (~つ)"
				description="Đếm đồ vật: hitotsu, futatsu..."
			/>
			<NumberColumn
				bind:rows={$gameConfig.numbersPeople}
				label="People (~人)"
				description="Đếm người: hitori, futari, sannin..."
			/>
			<NumberColumn
				bind:rows={$gameConfig.numbersDays}
				label="Days of Month (~日)"
				description="Đếm ngày: tsuitachi, futsuka, mikka..."
			/>
		</section>
	{:else if activeMode === "vocab"}
		<fieldset class="practice-type">
			<legend>Chiều luyện tập (Quiz Direction)...</legend>
			<div class="direction-container">
				<label class="dir-checkbox-label">
					<Checkbox
						checked={$gameConfig.vocabDirectionJpToVi}
						onclick={() => {
							gameConfig.update((cfg) => {
								if (cfg.vocabDirectionJpToVi && !cfg.vocabDirectionViToJp)
									return cfg
								return {
									...cfg,
									vocabDirectionJpToVi: !cfg.vocabDirectionJpToVi
								}
							})
						}}
					/>
					<span class="dir-text">
						<strong>Hiragana / Katakana → Tiếng Việt</strong>
						<span class="dir-sub">(Nhìn tiếng Nhật, gõ nghĩa tiếng Việt)</span>
					</span>
				</label>
				<label class="dir-checkbox-label">
					<Checkbox
						checked={$gameConfig.vocabDirectionViToJp}
						onclick={() => {
							gameConfig.update((cfg) => {
								if (cfg.vocabDirectionViToJp && !cfg.vocabDirectionJpToVi)
									return cfg
								return {
									...cfg,
									vocabDirectionViToJp: !cfg.vocabDirectionViToJp
								}
							})
						}}
					/>
					<span class="dir-text">
						<strong>Tiếng Việt → Hiragana / Katakana</strong>
						<span class="dir-sub">(Nhìn tiếng Việt, gõ Romaji hoặc Kana)</span>
					</span>
				</label>
			</div>
		</fieldset>

		<div class="quick-select-bar">
			<span class="quick-title">Chọn nhanh bài:</span>
			<button type="button" class="quick-btn" onclick={selectAllLessons}>
				Tất cả (Bài 1, 2, 3)
			</button>
			<button
				type="button"
				class="quick-btn"
				onclick={() => selectOnlyLesson("1")}
			>
				Chỉ Bài 1
			</button>
			<button
				type="button"
				class="quick-btn"
				onclick={() => selectOnlyLesson("2")}
			>
				Chỉ Bài 2
			</button>
			<button
				type="button"
				class="quick-btn"
				onclick={() => selectOnlyLesson("3")}
			>
				Chỉ Bài 3
			</button>
			<button type="button" class="quick-btn" onclick={clearAllLessons}>
				Bỏ chọn hết
			</button>
		</div>

		<section class="vocab-lessons-container">
			{#each lessonsData as lesson (lesson.id)}
				<VocabLessonCard {lesson} />
			{/each}
		</section>
	{/if}

	<div class="shuffle-setting-bar">
		<label class="shuffle-label" title="Xáo trộn ngẫu nhiên thứ tự các câu hỏi">
			<input
				type="checkbox"
				checked={$gameConfig.shuffleQuestions ?? true}
				onchange={(e) => {
					const checked = e.currentTarget.checked
					gameConfig.update((cfg) => ({ ...cfg, shuffleQuestions: checked }))
				}}
			/>
			<span class="shuffle-icon">
				<Icon path={mdiShuffle} size="1.2em" />
			</span>
			<span class="shuffle-text">
				<span class="shuffle-title">Xáo trộn thứ tự (Shuffle)</span>
				<span class="shuffle-desc">
					Đảo ngẫu nhiên vị trí các câu hỏi thay vì theo thứ tự cố định
				</span>
			</span>
		</label>
	</div>

	<MenuBar class="glass-morphism contrast">
		<div class="menu content-padding">
			<Button href="/" style="outline">
				<Icon path={mdiArrowLeft} size="1.25em" />
				Back
			</Button>
			<Button
				disabled={$dictionary.length === 0}
				onclick={async () => {
					playDropSound()
					quiz.reset($dictionary)
					await goto("/session")
				}}
			>
				Start quiz ({$dictionary.length})
				<Icon path={mdiArrowRight} size="1.25em" />
			</Button>
		</div>
	</MenuBar>
</div>

<style lang="postcss">
	.wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding-bottom: 6em;
	}

	.mode-switcher-container {
		display: flex;
		justify-content: center;
		margin-top: 2em;
		padding: 0 1em;
	}

	.mode-switcher {
		display: flex;
		background: var(--form-element-background, rgba(255, 255, 255, 0.08));
		padding: 4px;
		border-radius: 9999px;
		border: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.12));
		gap: 4px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.mode-btn {
		background: none;
		border: none;
		color: var(--text-color-light);
		padding: 0.6em 1.4em;
		border-radius: 9999px;
		font-family: inherit;
		font-size: 1em;
		font-weight: 500;
		cursor: pointer;
		transition: all 150ms var(--standard-curve);

		&:hover {
			color: var(--text-color);
		}

		&.active {
			background: var(--accent-color, #2563eb);
			color: var(--text-color-on-accent-color, #ffffff);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		}

		&:focus-visible {
			outline: var(--focus-color) solid 2px;
		}
	}

	.practice-type legend {
		margin-bottom: 1em;
	}

	.direction-container {
		display: flex;
		gap: 1.5em;
		flex-wrap: wrap;
		justify-content: center;
		max-width: 800px;
		margin: 0 auto;
	}

	.dir-checkbox-label {
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--surface-2, rgba(255, 255, 255, 0.04));
		border: 1px solid var(--background-contrast-light, rgba(255, 255, 255, 0.1));
		border-radius: 10px;
		padding: 0.8em 1.2em;
		cursor: pointer;
		user-select: none;
		transition: all 120ms ease;

		&:hover {
			border-color: rgba(37, 99, 235, 0.4);
		}
	}

	.dir-text {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
	}

	.dir-sub {
		font-size: 0.8em;
		color: var(--text-color-light);
		opacity: 0.85;
	}

	.quick-select-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 1.75em;
		padding: 0 1em;
	}

	.quick-title {
		font-size: 0.9em;
		font-weight: 600;
		color: var(--text-color-light);
		margin-right: 4px;
	}

	.quick-btn {
		background: var(--surface-2, rgba(255, 255, 255, 0.05));
		border: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.12));
		border-radius: 9999px;
		color: var(--text-color);
		font-family: inherit;
		font-size: 0.85em;
		font-weight: 500;
		padding: 0.35em 0.85em;
		cursor: pointer;
		transition: all 120ms ease;

		&:hover {
			background: var(--accent-color, #2563eb);
			color: #ffffff;
			border-color: transparent;
		}
	}

	.vocab-lessons-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5em;
		margin-top: 2em;
		padding: 0 1.5em;
	}

	.radio-buttons {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
	}
	.radio-buttons > :global(:not(:last-child)) {
		margin-right: 2em;
	}

	.columns {
		display: grid;
		grid-template-areas:
			"a b c"
			"a . d";
		grid-template-rows: masonry;
		column-gap: 3em;
		padding: 0 2em;
		justify-content: center;
		margin-top: 2.5em;

		> :global(*) {
			&:nth-child(1) {
				grid-area: a;
			}
			&:nth-child(2) {
				grid-area: b;
			}
			&:nth-child(3) {
				grid-area: c;
			}
			&:nth-child(4) {
				grid-area: d;
			}
		}

		@media screen and (max-width: 978px) {
			grid-template-areas:
				"a c"
				"a d"
				"b .";
		}

		@media screen and (max-width: 638px) {
			grid-template-areas:
				"a"
				"b"
				"c"
				"d";
		}
	}

	.number-columns {
		display: flex;
		flex-wrap: wrap;
		gap: 2em;
		padding: 0 2em;
		justify-content: center;
		margin-top: 2.5em;
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;
	}

	fieldset {
		border: none;
		padding: 0;
		margin: 0;
		display: flex;
		margin-top: 1.5em;
		justify-content: center;
	}

	legend {
		padding: 0;
		font-weight: 500;
		font-size: 1.2em;
		text-align: center;
		width: 100%;
	}

	.menu {
		display: flex;
		justify-content: center;
		gap: 1em;
	}

	.menu > :global(:nth-child(1) .svg-icon) {
		margin-left: -0.5em;
	}

	.menu > :global(:nth-child(2) .svg-icon) {
		margin-right: -0.5em;
	}

	.shuffle-setting-bar {
		display: flex;
		justify-content: center;
		margin-top: 2.5em;
		margin-bottom: 2em;
		padding: 0 1.5em;
	}

	.shuffle-label {
		display: flex;
		align-items: center;
		gap: 0.85em;
		background: var(--surface-2, rgba(255, 255, 255, 0.05));
		border: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.12));
		border-radius: 12px;
		padding: 0.85em 1.5em;
		cursor: pointer;
		user-select: none;
		max-width: 550px;
		width: 100%;
		transition: all 120ms ease;

		&:hover {
			border-color: rgba(37, 99, 235, 0.45);
			background: var(--surface-2, rgba(255, 255, 255, 0.08));
		}

		input[type="checkbox"] {
			accent-color: var(--accent-color, #2563eb);
			width: 1.25em;
			height: 1.25em;
			cursor: pointer;
		}
	}

	.shuffle-icon {
		display: flex;
		align-items: center;
		color: var(--accent-color, #2563eb);
	}

	.shuffle-text {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
	}

	.shuffle-title {
		font-weight: 600;
		font-size: 0.95em;
		color: var(--text-color);
	}

	.shuffle-desc {
		font-size: 0.8em;
		color: var(--text-color-light);
		opacity: 0.85;
	}
</style>
