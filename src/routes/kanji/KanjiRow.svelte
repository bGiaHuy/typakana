<script lang="ts">
	import type { KanjiItem, MeaningLanguage, PronunciationMode } from "$/lib/kanji/vocabulary"
	import type { Answer, Grade } from "$/lib/kanji/quiz"
	let {
		item,
		answer,
		grade,
		mode,
		meaningLanguage = "vietnamese",
		revealed,
		onchange
	}: {
		item: KanjiItem
		answer?: Answer
		grade?: Grade
		mode: PronunciationMode
		meaningLanguage?: MeaningLanguage
		revealed: boolean
		onchange: (field: keyof Answer, value: string) => void
	} = $props()
</script>

<div class="quiz-row">
	<div class="word">
		<span lang="ja">{item.kanji}</span>
		{#if item.note}<small title={item.note}>※ Xem lưu ý bên dưới</small>{/if}
	</div>
	{#each ["pronunciation", "meaning"] as field (field)}
		{@const key = field as keyof Answer}
		<div class="field">
			<label class="sr-only" for={`${item.id}-${field}`}>
				{item.kanji} — {field === "pronunciation"
					? "Cách đọc"
					: `Nghĩa (${meaningLanguage === "english" ? "English" : "Tiếng Việt"})`}
			</label>
			<div class="answer-input">
				<input
					id={`${item.id}-${field}`}
					value={answer?.[key] ?? ""}
					lang={field === "pronunciation" && mode === "hiragana" ? "ja" : "vi"}
					placeholder={field === "pronunciation"
						? mode === "hiragana"
							? "Nhập Hiragana"
							: "Nhập Romaji"
						: meaningLanguage === "english"
							? "Nhập nghĩa English"
							: "Nhập nghĩa tiếng Việt"}
					autocomplete="off"
					spellcheck="false"
					autocapitalize="none"
					aria-invalid={grade ? !grade[key] : undefined}
					aria-describedby={grade || revealed
						? `${item.id}-${field}-feedback`
						: undefined}
					oninput={(event) => onchange(key, event.currentTarget.value)}
				/>
				{#if grade}<span
						class="answer-icon"
						class:correct-icon={grade[key]}
						aria-hidden="true"
					>
						{grade[key] ? "✓" : "✗"}
					</span>{/if}
			</div>
			{#if grade || revealed}
				<small id={`${item.id}-${field}-feedback`}>
					{#if grade}<span class:correct={grade[key]}>
							{grade[key] ? "✓ Đúng" : "✗ Sai / chưa trả lời"}
						</span>{/if}
					{#if revealed}<span class="solution">
							{field === "pronunciation"
								? item[mode].join(" / ")
								: (meaningLanguage === "english" ? item.englishMeanings : [item.meaning]).join(" / ")}
						</span>{/if}
				</small>
			{/if}
		</div>
	{/each}
</div>

<style>
	.quiz-row {
		display: grid;
		grid-template-columns: 0.65fr 1fr 1fr;
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--text-color-lighter);
		align-items: start;
	}
	.word {
		font-size: 1.8rem;
		overflow-wrap: anywhere;
	}
	.word small {
		display: block;
		font-size: 0.7rem;
		color: var(--text-color-light);
	}
	.field {
		min-width: 0;
	}
	input {
		width: 100%;
		min-height: 2.8rem;
		border: 1px solid var(--text-color-light);
		border-radius: 0.4rem;
		padding: 0.65rem 2.6rem 0.65rem 0.65rem;
		font: inherit;
		color: var(--text-color);
		background: var(--form-element-background);
	}
	input[aria-invalid="true"] {
		border: 2px solid #dc2626;
		background: color-mix(in srgb, #ef4444 18%, var(--form-element-background));
	}
	input[aria-invalid="false"] {
		border: 2px solid #16803d;
		background: color-mix(in srgb, #22c55e 18%, var(--form-element-background));
	}
	.answer-input {
		position: relative;
	}
	.answer-icon {
		position: absolute;
		right: 0.8rem;
		top: 50%;
		transform: translateY(-50%);
		color: #ef4444;
		font-size: 1.3rem;
		font-weight: 700;
		pointer-events: none;
	}
	.correct-icon {
		color: #22c55e;
	}
	small {
		display: block;
		margin-top: 0.3rem;
		font-size: 0.8rem;
	}
	.correct {
		font-weight: 600;
	}
	.solution {
		display: block;
		margin-top: 0.25rem;
	}
	@media (max-width: 36em) {
		.quiz-row {
			grid-template-columns: 1fr 1fr;
			gap: 0.6rem;
		}
		.word {
			grid-column: 1 / -1;
		}
	}
	@media (max-width: 24em) {
		.quiz-row {
			grid-template-columns: 1fr;
		}
	}
</style>
