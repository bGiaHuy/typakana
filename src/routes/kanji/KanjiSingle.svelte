<script lang="ts">
	import { onMount, tick, untrack } from "svelte"
	import Button from "$/components/Button.svelte"
	import type { KanjiItem, MeaningLanguage, PronunciationMode } from "$/lib/kanji/vocabulary"
	import { gradeItem, gradeMeaning, scoreQuiz, type Answer, type Grade, type Grades } from "$/lib/kanji/quiz"
	import { playKanaSound } from "$/lib/sound"

	type Field = "pronunciation" | "meaning"
	type QueueEntry = { item: KanjiItem; retry: Field[] }

	let {
		vocabulary,
		mode,
		meaningLanguage
	}: { vocabulary: KanjiItem[]; mode: PronunciationMode; meaningLanguage: MeaningLanguage } = $props()

	let queue = $state<QueueEntry[]>(untrack(() => vocabulary.map((item) => ({ item, retry: ["pronunciation", "meaning"] }))))
	let index = $state(0)
	let activeField = $state<Field>("pronunciation")
	let answer = $state<Answer>({ pronunciation: "", meaning: "" })
	let fieldGrades = $state<Partial<Grade>>({})
	let grades = $state<Grades>({})
	let pronunciationInput: HTMLInputElement | undefined = $state()
	let meaningInput: HTMLInputElement | undefined = $state()
	let attempts = $state(0)
	let correctAnswers = $state(0)
	let entryComplete = $state(false)
	let awaitingCorrection = $state(false)
	let composing = false
	let voices = $state<SpeechSynthesisVoice[]>([])
	let selectedVoice = $state("")
	let meaningVoices = $derived(voices.filter((voice) =>
		voice.lang.toLowerCase().startsWith(meaningLanguage === "english" ? "en" : "vi")
	))

	onMount(() => {
		if (!("speechSynthesis" in window)) return
		const loadVoices = () => { voices = window.speechSynthesis.getVoices() }
		loadVoices()
		window.speechSynthesis.addEventListener("voiceschanged", loadVoices)
		return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
	})
	let finished = $derived(index >= queue.length)
	let current = $derived(queue[index])
	let result = $derived(scoreQuiz(vocabulary, grades))
	let meaningAnswers = $derived(
		meaningLanguage === "english" ? current?.item.englishMeanings ?? [] : current?.item.acceptedMeanings ?? []
	)

	function expected(field: Field) {
		if (field === "pronunciation") return current.item[mode].join(" / ")
		return meaningAnswers.join(" / ")
	}

	function isCorrect(field: Field, value: string) {
		if (field === "pronunciation") {
			return gradeItem(current.item, { pronunciation: value, meaning: "" }, mode).pronunciation
		}
		return gradeMeaning(current.item, value, meaningLanguage)
	}

	async function focusField(field: Field) {
		await tick()
		;(field === "pronunciation" ? pronunciationInput : meaningInput)?.focus()
	}

	async function submitField(field: Field = activeField) {
		if (composing) return
		if (awaitingCorrection) {
			awaitingCorrection = false
			await advanceField()
			if (entryComplete) nextEntry()
			return
		}
		if (entryComplete) {
			nextEntry()
			return
		}
		if (!current || field !== activeField || !answer[field].trim() || fieldGrades[field] !== undefined) return

		const correct = isCorrect(field, answer[field])
		fieldGrades = { ...fieldGrades, [field]: correct }
		attempts += 1
		if (correct) correctAnswers += 1
		if (field === "pronunciation") {
			void playKanaSound(current.item.hiragana[0])
		} else if (typeof window !== "undefined" && "speechSynthesis" in window) {
			const speech = new SpeechSynthesisUtterance(meaningAnswers[0])
			speech.lang = meaningLanguage === "english" ? "en-US" : "vi-VN"
			speech.voice = meaningVoices.find((voice) => voice.voiceURI === selectedVoice)
				?? meaningVoices.find((voice) => /Google/i.test(voice.name))
				?? meaningVoices[0] ?? null
			speech.rate = 0.9
			if (speech.voice || meaningLanguage === "english") window.speechSynthesis.speak(speech)
		}

		if (!correct) {
			awaitingCorrection = true
			return
		}
		await advanceField()
	}

	async function advanceField() {
		const field = activeField
		const correct = fieldGrades[field] === true
		if (field === "pronunciation") {
			if (current.retry.includes("meaning")) {
				activeField = "meaning"
				await focusField("meaning")
			} else {
				finishEntry({ pronunciation: correct, meaning: true })
			}
			return
		}

		finishEntry({
			pronunciation: fieldGrades.pronunciation ?? false,
			meaning: correct
		})
	}

	function finishEntry(grade: Grade) {
		grades = { ...grades, [current.item.id]: grade }
		const retry = (["pronunciation", "meaning"] as Field[]).filter((key) => !grade[key])
		if (retry.length) {
			queue = [...queue, { item: current.item, retry }]
		}
		entryComplete = true
	}

	function nextEntry() {
		index += 1
		entryComplete = false
		awaitingCorrection = false
		answer = { pronunciation: "", meaning: "" }
		fieldGrades = {}
		activeField = "pronunciation"
	}

	function handleKeydown(event: KeyboardEvent, field: Field) {
		if (event.key === "Enter") {
			event.preventDefault()
			event.stopPropagation()
			if (!event.isComposing && event.keyCode !== 229 && !event.repeat) void submitField(field)
		}
	}

	function startEntry() {
		activeField = current.retry[0]
		fieldGrades = {
			...(!current.retry.includes("pronunciation") ? { pronunciation: true } : {}),
			...(!current.retry.includes("meaning") ? { meaning: true } : {})
		}
		answer = {
			pronunciation: current.retry.includes("pronunciation") ? "" : current.item[mode][0],
			meaning: current.retry.includes("meaning") ? "" : meaningAnswers[0]
		}
		void focusField(activeField)
	}

	$effect(() => {
		// Initialize only when the queue entry changes, not when focus moves between fields.
		if (current) untrack(startEntry)
	})

	function restart() {
		queue = vocabulary.map((item) => ({ item, retry: ["pronunciation", "meaning"] }))
		index = 0
		answer = { pronunciation: "", meaning: "" }
		fieldGrades = {}
		grades = {}
		attempts = 0
		correctAnswers = 0
		entryComplete = false
		awaitingCorrection = false
		activeField = "pronunciation"
	}
</script>

<section class="single">
	<p>Ô nghĩa nhận cả tiếng Việt và English. Ngôn ngữ đã chọn dùng cho đáp án và giọng đọc.</p>
	<label>
		Giọng đọc nghĩa
		<select bind:value={selectedVoice}>
			<option value="">Tự chọn giọng {meaningLanguage === "english" ? "English" : "tiếng Việt"}</option>
			{#each meaningVoices as voice (voice.voiceURI)}
				<option value={voice.voiceURI}>{voice.name}</option>
			{/each}
		</select>
	</label>
	{#if meaningLanguage === "vietnamese" && !meaningVoices.length}
		<p role="status">Trình duyệt chưa có giọng tiếng Việt. Hãy bật hoặc cài giọng tiếng Việt trên thiết bị để đọc phần nghĩa.</p>
	{/if}
	<h1>Luyện từng từ</h1>
	<p role="status">{Math.min(index + 1, queue.length)}/{queue.length} lượt · {correctAnswers}/{attempts} đúng</p>
	<progress aria-label="Tiến độ bài luyện" value={index} max={queue.length}></progress>
	{#if finished}
		<h2>Hoàn thành!</h2>
		<p>Bạn đạt {result.score}/{result.maximum} điểm · {result.incorrect} ô sai hoặc chưa trả lời.</p>
		<Button onclick={restart}>Học lại</Button>
	{:else}
		<form
			oncompositionstart={() => (composing = true)}
			oncompositionend={() => (composing = false)}
			onsubmit={(event) => {
				event.preventDefault()
				void submitField()
			}}
		>
			<div class="kanji" lang="ja">{current.item.kanji}</div>
			<label>
				Cách đọc ({mode === "hiragana" ? "Hiragana" : "Romaji"})
				<span class="answer-input" class:correct={fieldGrades.pronunciation} class:incorrect={fieldGrades.pronunciation === false}>
					<input
						bind:this={pronunciationInput}
						name="pronunciation"
						bind:value={answer.pronunciation}
						readonly={!current.retry.includes("pronunciation") || fieldGrades.pronunciation !== undefined}
						onkeydown={(event) => handleKeydown(event, "pronunciation")}
						autocomplete="off"
						spellcheck="false"
						autocapitalize="none"
					/>
					{#if fieldGrades.pronunciation !== undefined}<span class="answer-icon" aria-hidden="true">{fieldGrades.pronunciation ? "✓" : "✗"}</span>{/if}
				</span>
			</label>
			<label>
				Nghĩa ({meaningLanguage === "english" ? "English" : "Tiếng Việt"})
				<span class="answer-input" class:correct={fieldGrades.meaning} class:incorrect={fieldGrades.meaning === false}>
					<input
						bind:this={meaningInput}
						name="meaning"
						bind:value={answer.meaning}
						readonly={!current.retry.includes("meaning") || fieldGrades.meaning !== undefined}
						onkeydown={(event) => handleKeydown(event, "meaning")}
						autocomplete="off"
						spellcheck="false"
					/>
					{#if fieldGrades.meaning !== undefined}<span class="answer-icon" aria-hidden="true">{fieldGrades.meaning ? "✓" : "✗"}</span>{/if}
				</span>
			</label>
			{#each ["pronunciation", "meaning"] as field}
				{#if fieldGrades[field as Field] === false}
					<div class="feedback incorrect" role="status">
						{field === "pronunciation" ? "Cách đọc" : "Nghĩa"}: <strong>{expected(field as Field)}</strong>
					</div>
				{/if}
			{/each}
			<div class="actions">
				<Button type="submit">{entryComplete || awaitingCorrection ? "Tiếp theo ↵" : "Chấm ô này ↵"}</Button>
			</div>
		</form>
	{/if}
</section>

<style>
	.single { max-width: 38rem; margin: 2rem auto; }
	.kanji { font-size: clamp(4rem, 18vw, 7rem); text-align: center; padding: 1rem; }
	label { display: block; margin: 1rem 0; }
	input { display: block; width: 100%; font: inherit; padding: 0.8rem 2.8rem 0.8rem 0.8rem; border: 1px solid var(--text-color-light); border-radius: 0.5rem; color: var(--text-color); background: var(--form-element-background); }
	.answer-input { display: block; position: relative; margin-top: 0.4rem; }
	.answer-input.correct input { border: 2px solid #16803d; background: color-mix(in srgb, #22c55e 18%, var(--form-element-background)); }
	.answer-input.incorrect input { border: 2px solid #dc2626; background: color-mix(in srgb, #ef4444 18%, var(--form-element-background)); }
	.answer-icon { position: absolute; right: 0.9rem; top: 50%; transform: translateY(-50%); font-size: 1.3rem; font-weight: 700; pointer-events: none; }
	.correct .answer-icon { color: #22c55e; }
	.incorrect .answer-icon { color: #ef4444; }
	.feedback { border-left: 3px solid var(--highlight-color); padding: 1rem; background: var(--background-contrast); }
	.actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
	progress { width: 100%; accent-color: var(--accent-color); }
</style>
