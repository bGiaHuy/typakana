<script lang="ts">
	import Button from "$/components/Button.svelte"
	import Checkbox from "$/components/Checkbox.svelte"
	import { shuffleArray } from "$/lib/random"
	import {
		lessons,
		selectLessons,
		type PronunciationMode,
		type MeaningLanguage,
		type KanjiItem
	} from "$/lib/kanji/vocabulary"
	import KanjiList from "./KanjiList.svelte"
	import KanjiSingle from "./KanjiSingle.svelte"
	let selected = $state<number[]>([1])
	let mode = $state<PronunciationMode>("hiragana")
	let meaningLanguage = $state<MeaningLanguage>("vietnamese")
	let layout = $state("single")
	let session = $state<{
		items: KanjiItem[]
		mode: PronunciationMode
		meaningLanguage: MeaningLanguage
		layout: string
	} | null>(null)
	let expanded = $state<number[]>([])
	let words = $derived(selectLessons(selected))
	function toggle(id: number) {
		selected = selected.includes(id)
			? selected.filter((value) => value !== id)
			: [...selected, id]
	}
</script>

<svelte:head>
	<title>Chọn bài Kanji · Type Kana</title>
	<meta
		name="description"
		content="Chọn bài Kanji 1–3 và luyện theo danh sách hoặc từng từ với phản hồi ngay."
	/>
</svelte:head>
<section class="content-padding">
	<div class="setup center">
		{#if session}
			<Button style="outline" onclick={() => (session = null)}>
				← Chọn bài Kanji
			</Button>
			{#if session.layout === "list"}<KanjiList
					vocabulary={session.items}
					initialMode={session.mode}
					initialMeaningLanguage={session.meaningLanguage}
				/>{:else}<KanjiSingle
					vocabulary={session.items}
					mode={session.mode}
					meaningLanguage={session.meaningLanguage}
				/>{/if}
		{:else}
			<a class="text-link" href="/">← Trang chủ</a>
			<h1>Chọn bài Kanji</h1>
			<p>Chọn một hoặc nhiều bài, sau đó chọn cách luyện.</p>
			<div class="lessons">
				{#each lessons as lesson (lesson.id)}
					{@const items = selectLessons([lesson.id])}
					<div class="lesson-card">
						<div class="lesson-header">
							<label>
								<Checkbox
									checked={selected.includes(lesson.id)}
									onclick={() => toggle(lesson.id)}
								/>
								<span>
									<strong>{lesson.title}</strong>
									<small>{lesson.description} · {items.length} từ</small>
								</span>
							</label>
							<button
								class="details"
								type="button"
								aria-expanded={expanded.includes(lesson.id)}
								onclick={() =>
									(expanded = expanded.includes(lesson.id)
										? expanded.filter((id) => id !== lesson.id)
										: [...expanded, lesson.id])}
							>
								{expanded.includes(lesson.id) ? "Thu gọn" : "Chi tiết"}
							</button>
						</div>
						{#if expanded.includes(lesson.id)}<div class="preview">
								{#each items as item (item.id)}<span lang="ja">
										{item.kanji}
									</span>{/each}
							</div>{/if}
					</div>
				{/each}
			</div>
			<fieldset>
				<legend>Chế độ luyện</legend>
				<label>
					<input type="radio" bind:group={layout} value="single" />
					Từng từ — phản hồi ngay sau khi chốt
				</label>
				<label>
					<input type="radio" bind:group={layout} value="list" />
					Danh sách — chấm toàn bài
				</label>
			</fieldset>
			<fieldset>
				<legend>Cách đọc</legend>
				<label>
					<input type="radio" bind:group={mode} value="hiragana" />
					Hiragana
				</label>
				<label>
					<input type="radio" bind:group={mode} value="romaji" />
					Romaji
				</label>
			</fieldset>
			<fieldset>
				<legend>Ngôn ngữ phần nghĩa</legend>
				<label>
					<input type="radio" bind:group={meaningLanguage} value="vietnamese" />
					Tiếng Việt
				</label>
				<label>
					<input type="radio" bind:group={meaningLanguage} value="english" />
					English
				</label>
			</fieldset>
			<div class="start">
				<span>Đã chọn {selected.length} bài · {words.length} từ</span>
				<Button
					disabled={words.length === 0}
					onclick={() =>
						(session = { items: shuffleArray(words), mode, meaningLanguage, layout })}
				>
					Bắt đầu học
				</Button>
			</div>
		{/if}
	</div>
</section>

<style>
	.setup {
		max-width: 58rem;
	}
	h1 {
		margin-top: 2rem;
	}
	.lessons {
		display: grid;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.lesson-card {
		border: 1px solid var(--background-contrast-light);
		border-radius: var(--standard-border-radius);
		padding: 1.25rem;
		background: var(--background-contrast);
	}
	.lesson-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.lesson-header label {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		cursor: pointer;
	}
	strong {
		font-size: 1.25rem;
	}
	small {
		display: block;
		margin-top: 0.25rem;
	}
	.details {
		font: inherit;
		color: var(--text-color);
		background: var(--form-element-background);
		border: 1px solid var(--text-color-light);
		border-radius: 0.4rem;
		padding: 0.5rem;
		cursor: pointer;
	}
	.preview {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding-top: 1rem;
		margin-top: 1rem;
		border-top: 1px solid var(--text-color-lighter);
	}
	fieldset {
		border: 1px solid var(--text-color-lighter);
		border-radius: 0.5rem;
		margin: 1rem 0;
		padding: 1rem;
	}
	fieldset label {
		display: inline-block;
		margin: 0.5rem 1.25rem 0.5rem 0;
	}
	.start {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		margin-top: 1.5rem;
	}
</style>
