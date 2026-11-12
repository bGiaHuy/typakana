<script lang="ts">
	import { onMount, tick } from "svelte"
	import Button from "$/components/Button.svelte"
	import deck from "$/lib/speaking/deck.json"
	import { shuffleArray } from "$/lib/random"
	import {
		readSession,
		selectQuestions,
		type Rating
	} from "$/lib/speaking/session"

	const topics = [
		["intro", "Tên · Quốc tịch · Tuổi · Nghề"],
		["dates", "Sinh nhật · Sở thích · Lịch"],
		["floors", "Tầng · Địa điểm"],
		["objects", "Gọi tên đồ vật"],
		["ordering", "Gọi món"],
		["shopping", "Giá · Xuất xứ · Sở hữu"],
		["hours", "Giờ mở cửa · Ngày nghỉ"],
		["actions", "Hành động theo tranh"],
		["destinations", "Đi đâu · Làm gì"],
		["places", "Hoạt động tại địa điểm"],
		["time-actions", "Giờ thực hiện hành động"],
		["personal", "Hỏi về bản thân"]
	]
	const questionMap = new Map(deck.questions.map((q) => [q.id, q]))
	const sceneMap = new Map(deck.scenes.map((s) => [s.id, s]))
	const storageKey = "jpd113-speaking-v1"
	let ratings = $state<Record<string, Rating>>({})
	let queue = $state<string[]>([])
	let index = $state(0)
	let ready = $state(false)
	let active = $state(false)
	let topic = $state("all")
	let picture = $state("all")
	let mode = $state<"all" | "review" | "unseen">("all")
	let random = $state(true)
	let revealed = $state(false)
	let showTranslation = $state(false)
	let draft = $state("")
	let message = $state("")
	let storageMessage = $state("")
	let voiceAvailable = $state(false)
	let canRecord = $state(false)
	let recording = $state(false)
	let micPending = $state(false)
	let recordingUrl = $state("")
	let recorder: MediaRecorder | undefined
	let stream: MediaStream | undefined
	let recordingGeneration = 0

	let scenes = $derived(
		deck.scenes.filter((s) => topic === "all" || s.category === topic)
	)
	let selectedScenes = $derived(
		scenes.filter((s) => picture === "all" || s.id === picture)
	)
	let available = $derived(
		selectQuestions(
			deck.questions,
			selectedScenes.map((s) => s.id),
			ratings,
			mode
		)
	)
	let current = $derived(questionMap.get(queue[index]))
	let scene = $derived(current ? sceneMap.get(current.sceneId) : undefined)
	let finished = $derived(queue.length > 0 && index >= queue.length)
	let remembered = $derived(
		Object.values(ratings).filter((r) => r === "remembered").length
	)
	let needsReview = $derived(
		Object.values(ratings).filter((r) => r === "review").length
	)
	let sceneQuestions = $derived(
		current ? deck.questions.filter((q) => q.sceneId === current.sceneId) : []
	)

	function stopAudio() {
		if (typeof window !== "undefined" && "speechSynthesis" in window)
			window.speechSynthesis.cancel()
	}

	function clearRecording() {
		recordingGeneration++
		if (recorder && recorder.state !== "inactive") recorder.stop()
		stream?.getTracks().forEach((track) => track.stop())
		stream = undefined
		recorder = undefined
		recording = false
		micPending = false
		if (recordingUrl) URL.revokeObjectURL(recordingUrl)
		recordingUrl = ""
	}

	async function resetCard() {
		stopAudio()
		clearRecording()
		revealed = false
		showTranslation = false
		draft = ""
		message = ""
		await tick()
		if (active)
			document.querySelector(".session-bar")?.scrollIntoView({ block: "start" })
	}

	function start(limit?: number) {
		const selected = random || limit ? shuffleArray(available) : available
		queue = selected.slice(0, limit).map((q) => q.id)
		index = 0
		active = queue.length > 0
		resetCard()
	}

	function advance(rating?: Rating) {
		if (!current || !revealed) return
		if (rating) ratings = { ...ratings, [current.id]: rating }
		index++
		resetCard()
	}

	function jump(id: string) {
		const position = queue.indexOf(id)
		if (position < 0) return
		index = position
		resetCard()
	}

	function speak(text: string) {
		if (!voiceAvailable) return
		stopAudio()
		const speech = new SpeechSynthesisUtterance(text)
		speech.lang = "ja-JP"
		speech.rate = 0.8
		speech.voice =
			window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ja")) ??
			null
		speech.onerror = (event) => {
			if (event.error !== "canceled" && event.error !== "interrupted")
				message = "Không phát được giọng Nhật. Bạn vẫn có thể luyện bằng chữ."
		}
		window.speechSynthesis.speak(speech)
	}

	async function record() {
		if (recording && recorder) {
			recorder.stop()
			return
		}
		clearRecording()
		stopAudio()
		const generation = recordingGeneration
		micPending = true
		message = ""
		try {
			const media = await navigator.mediaDevices.getUserMedia({ audio: true })
			if (generation !== recordingGeneration) {
				media.getTracks().forEach((t) => t.stop())
				return
			}
			stream = media
			const device = new MediaRecorder(media)
			recorder = device
			const chunks: Blob[] = []
			device.ondataavailable = (event) => {
				if (event.data.size) chunks.push(event.data)
			}
			device.onstop = () => {
				media.getTracks().forEach((t) => t.stop())
				if (generation !== recordingGeneration) return
				recording = false
				if (chunks.length)
					recordingUrl = URL.createObjectURL(
						new Blob(chunks, { type: device.mimeType })
					)
			}
			device.onerror = () => {
				clearRecording()
				message =
					"Ghi âm bị gián đoạn. Bạn có thể thử lại hoặc tự nói thành tiếng."
			}
			device.start()
			recording = true
		} catch {
			if (generation === recordingGeneration) {
				clearRecording()
				message =
					"Không truy cập được micro. Kiểm tra quyền micro hoặc tự trả lời thành tiếng."
			}
		} finally {
			if (generation === recordingGeneration) micPending = false
		}
	}

	onMount(() => {
		try {
			const saved = readSession(localStorage.getItem(storageKey), [
				...questionMap.keys()
			])
			ratings = saved.ratings
			queue = saved.queue
			index = saved.index
		} catch {
			storageMessage =
				"Trình duyệt không cho lưu tiến độ; bạn vẫn luyện được trong phiên này."
		}
		const updateVoices = () => {
			voiceAvailable =
				"speechSynthesis" in window &&
				window.speechSynthesis.getVoices().some((v) => v.lang.startsWith("ja"))
		}
		updateVoices()
		window.speechSynthesis?.addEventListener("voiceschanged", updateVoices)
		canRecord =
			!!navigator.mediaDevices?.getUserMedia &&
			typeof MediaRecorder !== "undefined"
		ready = true
		return () => {
			window.speechSynthesis?.removeEventListener("voiceschanged", updateVoices)
			stopAudio()
			clearRecording()
		}
	})

	$effect(() => {
		if (!ready) return
		try {
			localStorage.setItem(
				storageKey,
				JSON.stringify({ ratings, queue, index })
			)
		} catch {
			storageMessage =
				"Không lưu được tiến độ. Giữ tab này mở để tiếp tục luyện."
		}
	})
</script>

<svelte:head>
	<title>Luyện Speaking JPD113 · Type Kana</title>
	<meta
		name="description"
		content="Luyện vấn đáp JPD113 theo ảnh trong đề: câu hỏi tiếng Nhật, đáp án mẫu, ghi âm và ôn câu chưa thuộc."
	/>
</svelte:head>

<section class="speaking-page content-padding">
	<div class="shell content-width center">
		<nav>
			<a class="text-link" href="/">← Trang chủ</a>
			<span>JPD113 / Speaking</span>
		</nav>
		<header>
			<p class="eyebrow">見て、話しましょう。</p>
			<h1>Luyện nói theo tranh</h1>
			<p>Nhìn ảnh, nói câu trả lời, rồi mở đáp án để đối chiếu.</p>
			<div class="stats" aria-label="Tiến độ toàn bộ đề">
				<span>
					<strong>{deck.scenes.filter((s) => s.image).length}</strong>
					ảnh đã cắt
				</span>
				<span>
					<strong>{deck.questions.length}</strong>
					câu hỏi
				</span>
				<span>
					<strong>{remembered}</strong>
					đã thuộc
				</span>
				<span>
					<strong>{needsReview}</strong>
					cần ôn
				</span>
			</div>
		</header>

		{#if storageMessage}<p class="notice" role="status">
				{storageMessage}
			</p>{/if}

		{#if !active}
			<section class="setup" aria-labelledby="setup-title">
				<h2 id="setup-title">Chọn phần cần luyện</h2>
				<div class="filters">
					<label>
						Chủ đề
						<select
							aria-label="Chủ đề"
							bind:value={topic}
							onchange={() => {
								picture = "all"
							}}
						>
							<option value="all">Tất cả chủ đề</option>
							{#each topics as [value, label] (value)}<option {value}>
									{label}
								</option>{/each}
						</select>
					</label>
					<label>
						Ảnh / tình huống
						<select aria-label="Ảnh / tình huống" bind:value={picture}>
							<option value="all">Tất cả ảnh trong chủ đề</option>
							{#each scenes as s (s.id)}<option value={s.id}>
									Tr. {s.page} · {s.title}
								</option>{/each}
						</select>
					</label>
					<label>
						Câu cần luyện
						<select aria-label="Câu cần luyện" bind:value={mode}>
							<option value="all">Tất cả câu hỏi</option>
							<option value="review">Câu đã đánh dấu cần ôn</option>
							<option value="unseen">Câu chưa tự chấm</option>
						</select>
					</label>
				</div>
				<label class="check">
					<input type="checkbox" bind:checked={random} />
					Trộn ngẫu nhiên câu hỏi giữa các chủ đề đã chọn (bỏ chọn để luyện theo từng
					ảnh)
				</label>
				<p>
					<strong>{available.length}</strong>
					câu phù hợp · {selectedScenes.length} ảnh / tình huống
				</p>
				<div class="actions">
					<Button
						disabled={!ready || !available.length}
						onclick={() => start()}
					>
						Bắt đầu luyện
					</Button>
					<Button
						style="outline"
						disabled={!ready || !available.length}
						onclick={() => start(20)}
					>
						Thi thử 20 câu ngẫu nhiên
					</Button>
					{#if queue.length && !finished}<Button
							style="outline"
							onclick={() => {
								resetCard()
								active = true
							}}
						>
							Tiếp tục câu {index + 1}/{queue.length}
						</Button>{/if}
				</div>
				{#if !available.length}<p role="status">
						Không có câu phù hợp. Đổi chủ đề hoặc chọn “Tất cả câu hỏi”.
					</p>{/if}
			</section>
			<details class="guide">
				<summary>Cách luyện và phạm vi đề</summary>
				<p>
					Toàn bộ trang bài tập có hình từ PDF đã được đưa vào bộ đề, kèm phần
					hỏi không tranh. Mỗi ảnh có các câu hỏi phù hợp với thông tin trong
					ảnh; đây là bộ câu hỏi biên soạn theo đề, không phải dự đoán chính xác
					câu giáo viên sẽ hỏi.
				</p>
				<p>
					Nói thành tiếng hoặc ghi âm → mở đáp án → tự đánh giá “Đã thuộc” /
					“Cần ôn”. Câu hỏi về bản thân và hoạt động ở địa điểm có nhiều đáp án
					đúng. App không tự chấm phát âm.
				</p>
				<p>
					Ghi âm chỉ giữ tạm trong tab, không tải lên máy chủ và sẽ bỏ khi đổi
					câu. Tiến độ tự chấm lưu trên trình duyệt này. Giọng đọc cần thiết bị
					có giọng tiếng Nhật.
				</p>
			</details>
		{:else if finished}
			<section class="result" aria-live="polite">
				<p class="eyebrow">おつかれさまでした。</p>
				<h2>Đã đi hết {queue.length} câu</h2>
				<p>
					Trong lượt này: {queue.filter((id) => ratings[id] === "remembered")
						.length} câu đã thuộc · {queue.filter(
						(id) => ratings[id] === "review"
					).length} câu cần ôn · {queue.filter((id) => !ratings[id]).length} câu chưa
					chấm.
				</p>
				<div class="actions">
					<Button
						onclick={() => {
							active = false
							mode = "review"
						}}
					>
						Ôn câu chưa thuộc
					</Button><Button
						style="outline"
						onclick={() => {
							active = false
							mode = "all"
						}}
					>
						Chọn lượt luyện mới
					</Button>
				</div>
			</section>
		{:else if current && scene}
			<div class="session-bar">
				<button
					class="plain"
					onclick={() => {
						resetCard()
						active = false
					}}
				>
					← Đổi phần luyện
				</button>
				<span>Câu {index + 1} / {queue.length}</span>
			</div>
			<progress
				max={queue.length}
				value={index}
				aria-label="Tiến độ lượt luyện"
			></progress>
			<div class="practice">
				<figure>
					{#if scene.image}<a
							class="image-link"
							href={scene.image}
							target="_blank"
							rel="noopener"
							title="Mở ảnh lớn"
						>
							<img
								src={scene.image}
								alt="Ảnh đề trang {scene.page}: {scene.title}"
								width={scene.width}
								height={scene.height}
							/>
						</a>{:else}<div class="no-picture" lang="ja">
							あなたについて
							<br />
							<span>Trả lời về bản thân</span>
						</div>{/if}
					<details class="picture-questions">
						<summary>
							{sceneQuestions.length} câu hỏi của ảnh / tình huống này
						</summary>
						<ol>
							{#each sceneQuestions as q (q.id)}<li>
									<button
										class="plain"
										lang="ja"
										disabled={!queue.includes(q.id)}
										aria-current={q.id === current.id ? "step" : undefined}
										onclick={() => jump(q.id)}
									>
										{q.jp}
									</button>
								</li>{/each}
						</ol>
						<small>Câu ngoài lượt luyện hiện tại được làm mờ.</small>
					</details>
					<figcaption>
						Trang {scene.page} · {scene.title}{#if scene.image}
							· Bấm ảnh để phóng to{/if}
					</figcaption>
				</figure>
				<article class="question" aria-labelledby="question-title">
					<p class="eyebrow">
						Câu hỏi{ratings[current.id] === "review"
							? " · Cần ôn"
							: ratings[current.id] === "remembered"
								? " · Đã thuộc"
								: ""}
					</p>
					<h2
						id="question-title"
						lang="ja"
						aria-live="polite"
						aria-atomic="true"
					>
						{current.jp}
					</h2>
					<div class="actions">
						<button
							class="plain"
							disabled={!voiceAvailable || recording || micPending}
							onclick={() => speak(current.jp)}
						>
							Nghe câu hỏi
						</button>
						<button
							class="plain"
							aria-expanded={showTranslation}
							onclick={() => {
								showTranslation = !showTranslation
							}}
						>
							{showTranslation ? "Ẩn nghĩa" : "Xem nghĩa tiếng Việt"}
						</button>
					</div>
					{#if !voiceAvailable}<small>
							Thiết bị chưa có giọng đọc tiếng Nhật.
						</small>{/if}
					{#if showTranslation}<p class="translation">{current.vi}</p>{/if}
					<label class="draft-label" for="answer">
						Câu trả lời của bạn <small>(không bắt buộc gõ)</small>
					</label>
					<textarea
						id="answer"
						bind:value={draft}
						placeholder="Nói thành tiếng hoặc ghi lại câu trả lời ở đây…"
						rows="3"
					></textarea>
					<div class="recording">
						<button
							class="plain"
							disabled={!canRecord || micPending}
							onclick={record}
						>
							{micPending
								? "Đang mở micro…"
								: recording
									? "Dừng ghi âm"
									: "Ghi âm câu trả lời"}
						</button>
						{#if recording}<span role="status">
								Đang ghi âm…
							</span>{/if}{#if recordingUrl}<audio
								src={recordingUrl}
								controls
								aria-label="Nghe lại câu trả lời của bạn"
							></audio>{/if}
					</div>
					{#if !canRecord}<small>
							Ghi âm cần trình duyệt hỗ trợ micro trên HTTPS hoặc localhost.
						</small>{/if}
					{#if message}<p class="notice" role="status">{message}</p>{/if}
					{#if !revealed}
						<div class="reveal">
							<Button
								onclick={() => {
									if (recording) recorder?.stop()
									revealed = true
								}}
							>
								Xem đáp án mẫu
							</Button>
						</div>
					{:else}
						<section class="answer" aria-label="Đáp án mẫu" aria-live="polite">
							<p class="eyebrow">Đáp án mẫu · tự đối chiếu</p>
							<p lang="ja">{current.answer}</p>
							{#if current.note}<p class="answer-note">{current.note}</p>{/if}
							<button
								class="plain"
								disabled={!voiceAvailable || recording || micPending}
								onclick={() => speak(current.answer)}
							>
								Nghe đáp án
							</button>
						</section>
						<div class="actions rating">
							<Button style="outline" onclick={() => advance("review")}>
								Cần ôn lại
							</Button><Button onclick={() => advance("remembered")}>
								Đã thuộc →
							</Button>
							<button class="plain" onclick={() => advance()}>
								Bỏ qua, chưa chấm
							</button>
						</div>
					{/if}
					<div class="previous">
						<button
							class="plain"
							disabled={index === 0}
							onclick={() => {
								index--
								resetCard()
							}}
						>
							← Câu trước
						</button>
					</div>
				</article>
			</div>
		{/if}
		<footer>
			Nguồn ảnh: {deck.source}. Bộ luyện cá nhân · Đáp án được biên soạn để ôn
			tập.
		</footer>
	</div>
</section>

<style>
	.shell {
		max-width: 78rem;
		padding-top: 1.4rem;
		padding-bottom: 2rem;
	}
	.speaking-page .text-link {
		color: var(--text-color);
		border-color: currentColor;
	}
	.speaking-page :global(.button .effect) {
		min-height: 44px;
	}
	nav,
	.session-bar {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: center;
	}
	nav span,
	figcaption,
	small,
	footer {
		font-size: 0.85rem;
	}
	header {
		margin: 3rem 0 2rem;
	}
	h1 {
		font-size: clamp(2rem, 4vw, 3.25rem);
		margin-bottom: 0.6rem;
	}
	.eyebrow {
		font-size: 0.85rem;
		letter-spacing: 0.06em;
		margin-bottom: 0.65rem;
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 2rem;
		border-block: 1px solid var(--text-color-lighter);
		padding: 1rem 0;
		margin-top: 1.5rem;
	}
	.stats strong {
		font-size: 1.35rem;
		font-variant-numeric: tabular-nums;
	}
	.setup,
	.result {
		background: var(--background-contrast);
		border-radius: var(--standard-border-radius);
		padding: 1.5rem;
	}
	.filters {
		display: grid;
		grid-template-columns: 1fr 1.3fr 1fr;
		gap: 1rem;
		margin-bottom: 1.3rem;
	}
	label {
		display: grid;
		gap: 0.5rem;
	}
	select,
	textarea {
		width: 100%;
		min-width: 0;
		padding: 0.7rem;
		border: 1px solid var(--text-color);
		border-radius: 0.5rem;
		background: var(--form-element-background);
		color: var(--text-color);
		font: inherit;
	}
	select {
		min-height: 48px;
	}
	textarea {
		resize: vertical;
		line-height: 1.6;
	}
	.check {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin-bottom: 1rem;
	}
	.check input {
		width: 1.2rem;
		height: 1.2rem;
		flex-shrink: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1rem;
		align-items: center;
	}
	.plain {
		border: 1px solid currentColor;
		border-radius: 0.4rem;
		background: transparent;
		color: inherit;
		padding: 0.6rem 0.8rem;
		min-height: 44px;
		font: inherit;
		cursor: pointer;
	}
	.plain:hover:not(:disabled) {
		background: var(--background-contrast-light);
	}
	button:disabled {
		opacity: 0.55;
		cursor: default;
	}
	button:focus-visible,
	select:focus-visible,
	textarea:focus-visible,
	summary:focus-visible,
	.image-link:focus-visible {
		outline: 3px solid var(--focus-color);
		outline-offset: 3px;
	}
	.guide {
		margin-top: 1.4rem;
		max-width: 58rem;
		line-height: 1.7;
	}
	summary {
		cursor: pointer;
		padding-block: 0.7rem;
		min-height: 44px;
	}
	.session-bar {
		margin-bottom: 0.8rem;
	}
	progress {
		display: block;
		width: 100%;
		height: 0.45rem;
		accent-color: var(--accent-color);
		margin-bottom: 1.5rem;
	}
	.practice {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 2rem;
		align-items: start;
	}
	figure {
		margin: 0;
		min-width: 0;
	}
	.image-link {
		display: flex;
		justify-content: center;
		background: #fffaf0;
		border: 1px solid var(--text-color-lighter);
		border-radius: 0.7rem;
		overflow: hidden;
	}
	img {
		display: block;
		width: 100%;
		height: auto;
		max-height: 65vh;
		object-fit: contain;
	}
	figcaption {
		margin-top: 0.7rem;
		line-height: 1.6;
	}
	.no-picture {
		text-align: center;
		display: grid;
		align-content: center;
		min-height: 17rem;
		font-size: 2rem;
		background: var(--background-contrast);
		border-radius: 0.7rem;
	}
	.no-picture span {
		font-size: 1rem;
		margin-top: 1rem;
	}
	.question h2 {
		font-size: clamp(1.4rem, 2.6vw, 2rem);
		line-height: 1.7;
		overflow-wrap: anywhere;
	}
	.question > small {
		display: block;
		margin: 0.7rem 0;
	}
	.translation {
		padding-top: 0.8rem;
		margin-bottom: 0;
	}
	.draft-label {
		display: block;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}
	.recording {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.7rem;
		margin-block: 0.7rem;
	}
	audio {
		width: 100%;
		max-width: 28rem;
	}
	.reveal {
		margin-top: 1.5rem;
	}
	.answer {
		border-left: 3px solid var(--accent-color);
		background: var(--background-contrast);
		padding: 1rem 1.2rem;
		margin-top: 1.2rem;
		border-radius: 0 0.5rem 0.5rem 0;
	}
	.answer > p[lang] {
		font-size: 1.5rem;
		line-height: 1.8;
		margin-bottom: 0.7rem;
	}
	.answer-note {
		line-height: 1.7;
		font-size: 0.95rem;
	}
	.rating {
		margin-top: 1rem;
	}
	.previous {
		margin-top: 1.2rem;
	}
	.notice {
		border-left: 3px solid var(--highlight-color);
		padding: 0.6rem 1rem;
		line-height: 1.6;
	}
	.picture-questions {
		margin-top: 1rem;
	}
	.picture-questions ol {
		padding-left: 1.5rem;
	}
	.picture-questions li {
		margin-bottom: 0.5rem;
	}
	.picture-questions button {
		text-align: left;
		border: 0;
		width: 100%;
	}
	[aria-current="step"] {
		font-weight: bold;
		background: var(--background-contrast);
	}
	footer {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--text-color-lighter);
		line-height: 1.6;
	}
	@media (max-width: 56em) {
		.filters {
			grid-template-columns: 1fr;
		}
		.practice {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		img {
			max-height: 55vh;
		}
		header {
			margin-top: 2rem;
		}
	}
	@media (max-width: 28em) {
		nav {
			align-items: start;
			flex-direction: column;
		}
		.setup {
			padding: 1rem;
		}
	}
</style>
