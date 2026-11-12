// Optional browser check: use an installed Playwright module, without an app dependency.
import { strict as assert } from "node:assert"
import { readFileSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
const { chromium } = await import(
	process.env.PLAYWRIGHT_MODULE
		? pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE, "index.mjs")).href
		: "playwright"
)
const directory = dirname(fileURLToPath(import.meta.url))
const deck = JSON.parse(
	readFileSync(resolve(directory, "../src/lib/speaking/deck.json"), "utf8")
)
const url = process.env.SPEAKING_URL || "http://127.0.0.1:5173"
const output = resolve(directory, "../../output/speaking")
mkdirSync(output, { recursive: true })
;(async () => {
	const browser = await chromium.launch({
		headless: true,
		channel: "msedge",
		args: [
			"--use-fake-device-for-media-stream",
			"--use-fake-ui-for-media-stream"
		]
	})
	try {
		const context = await browser.newContext({
			viewport: { width: 1440, height: 1000 },
			permissions: ["microphone"],
			reducedMotion: "reduce"
		})
		const page = await context.newPage()
		const errors = []
		page.on("pageerror", (error) => errors.push(error.message))
		await page.goto(url + "/speaking")
		await page.waitForLoadState("networkidle")
		await page
			.getByRole("button", { name: "Bắt đầu luyện", exact: true })
			.waitFor()
		const shuffle = page.getByRole("checkbox", { name: /Trộn ngẫu nhiên/ })
		assert.ok(await shuffle.isChecked(), "shuffle is enabled by default")
		assert.equal(
			await page.getByLabel("Chủ đề", { exact: true }).inputValue(),
			"all"
		)
		await page
			.getByRole("button", { name: "Bắt đầu luyện", exact: true })
			.click()
		const mixed = await page.evaluate(
			() => JSON.parse(localStorage.getItem("jpd113-speaking-v1")).queue
		)
		assert.equal(mixed.length, deck.questions.length)
		assert.equal(new Set(mixed).size, deck.questions.length)
		assert.notDeepEqual(
			mixed,
			deck.questions.map((q) => q.id)
		)
		const categories = new Map(deck.scenes.map((s) => [s.id, s.category]))
		const questions = new Map(deck.questions.map((q) => [q.id, q]))
		assert.equal(
			new Set(mixed.map((id) => categories.get(questions.get(id).sceneId)))
				.size,
			12
		)
		await page
			.getByRole("button", { name: "← Đổi phần luyện", exact: true })
			.click()
		await shuffle.uncheck()
		await page.getByLabel("Chủ đề", { exact: true }).selectOption("intro")
		await page
			.getByLabel("Ảnh / tình huống", { exact: true })
			.selectOption("p011-1")
		await page
			.getByRole("button", { name: "Bắt đầu luyện", exact: true })
			.click()
		await page
			.getByRole("heading", { name: "このひとの おなまえは なんですか。" })
			.waitFor()
		assert.equal(await page.locator(".answer").count(), 0)
		await page.locator("figure img").evaluate((im) => im.decode())
		assert.ok(
			await page
				.locator("figure img")
				.evaluate((im) => im.complete && im.naturalWidth > 0)
		)
		await page.getByRole("button", { name: "Xem nghĩa tiếng Việt" }).click()
		assert.ok(
			(await page.locator(".translation").innerText()).includes("Người này tên")
		)
		await page
			.getByLabel("Câu trả lời của bạn", { exact: false })
			.fill("オリビアさんです。")
		await page
			.getByRole("button", { name: "Ghi âm câu trả lời", exact: true })
			.click()
		await page
			.getByRole("button", { name: "Dừng ghi âm", exact: true })
			.waitFor()
		await page.waitForTimeout(600)
		await page.getByRole("button", { name: "Dừng ghi âm", exact: true }).click()
		await page.locator("audio").waitFor()
		assert.ok(
			(await page.locator("audio").getAttribute("src")).startsWith("blob:")
		)
		assert.ok(
			await page
				.locator("audio")
				.evaluate(
					async (audio) => (await (await fetch(audio.src)).blob()).size > 1000
				)
		)
		await page
			.getByRole("button", { name: "Kiểm tra Romaji", exact: true })
			.click()
		await page
			.getByRole("status")
			.filter({ hasText: "Đúng — khớp đáp án mẫu" })
			.waitFor()
		assert.ok(
			(await page.locator(".answer").innerText()).includes("オリビアさんです。")
		)
		await page.screenshot({
			path: resolve(output, "practice-desktop.png"),
			fullPage: true
		})
		await page.getByRole("button", { name: "Cần ôn lại", exact: true }).click()
		assert.equal(await page.locator("audio").count(), 0)
		assert.equal(await page.locator("textarea").inputValue(), "")
		await page
			.getByRole("button", { name: "Xem đáp án mẫu", exact: true })
			.click()
		await page.getByRole("button", { name: "Đã thuộc →", exact: true }).click()
		await page.reload()
		await page.getByRole("button", { name: /Tiếp tục câu 3/ }).click()
		assert.ok(
			(await page.locator("#question-title").innerText()).includes(
				"どこの くに"
			)
		)
		await page
			.getByRole("button", { name: "← Đổi phần luyện", exact: true })
			.click()
		await page
			.getByLabel("Câu cần luyện", { exact: true })
			.selectOption("review")
		await page
			.getByRole("button", { name: "Bắt đầu luyện", exact: true })
			.click()
		await page
			.getByRole("button", { name: "Xem đáp án mẫu", exact: true })
			.click()
		await page.getByRole("button", { name: "Đã thuộc →", exact: true }).click()
		await page
			.getByRole("heading", { name: "Đã đi hết 1 câu", exact: true })
			.waitFor()
		await page
			.getByRole("button", { name: "Chọn lượt luyện mới", exact: true })
			.click()
		await page.getByLabel("Chủ đề", { exact: true }).selectOption("objects")
		await page
			.getByLabel("Ảnh / tình huống", { exact: true })
			.selectOption("p038-object-14")
		await page
			.getByRole("button", { name: "Bắt đầu luyện", exact: true })
			.click()
		await page.locator("textarea").fill("kare desu")
		await page.locator("textarea").press("Enter")
		await page
			.getByRole("status")
			.filter({ hasText: "Chưa khớp đáp án mẫu" })
			.waitFor()
		await page.locator("textarea").fill("karē desu")
		assert.equal(await page.getByRole("status").count(), 0)
		await page
			.getByRole("button", { name: "Kiểm tra Romaji", exact: true })
			.click()
		await page
			.getByRole("status")
			.filter({ hasText: "Đúng — khớp đáp án mẫu" })
			.waitFor()
		assert.ok(
			(await page.locator(".answer").innerText()).includes("karee desu")
		)
		await page
			.getByRole("button", { name: "← Đổi phần luyện", exact: true })
			.click()
		await page.getByLabel("Chủ đề", { exact: true }).selectOption("personal")
		await page
			.getByRole("button", { name: "Bắt đầu luyện", exact: true })
			.click()
		assert.equal(await page.locator("figure img").count(), 0)
		await page.locator("textarea").fill("watashi wa tarou desu")
		await page.locator("textarea").press("Enter")
		await page.getByRole("status").filter({ hasText: "Câu hỏi mở" }).waitFor()
		await page
			.getByRole("button", { name: "← Đổi phần luyện", exact: true })
			.click()
		await page
			.getByRole("button", {
				name: "Đề thi: 2 câu / chủ đề (24 câu)",
				exact: true
			})
			.click()
		assert.equal(await page.locator("progress").getAttribute("max"), "24")
		const exam = await page.evaluate(
			() => JSON.parse(localStorage.getItem("jpd113-speaking-v1")).queue
		)
		assert.equal(new Set(exam).size, 24)
		for (const category of new Set(categories.values())) {
			assert.equal(
				exam.filter(
					(id) => categories.get(questions.get(id).sceneId) === category
				).length,
				2
			)
		}
		await page.setViewportSize({ width: 375, height: 812 })
		await page.screenshot({
			path: resolve(output, "practice-mobile.png"),
			fullPage: true
		})
		assert.ok(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth
			),
			"mobile overflow"
		)
		await page.emulateMedia({ colorScheme: "dark" })
		if (await page.locator("figure img").count())
			await page.locator("figure img").evaluate(async (im) => {
				await im.decode()
				await new Promise((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(resolve))
				)
			})
		await page.screenshot({
			path: resolve(output, "practice-mobile-dark.png"),
			fullPage: true
		})
		await page.setViewportSize({ width: 812, height: 375 })
		assert.ok(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth
			),
			"landscape overflow"
		)
		for (const scene of deck.scenes.filter((s) => s.image)) {
			const response = await context.request.get(url + scene.image)
			assert.equal(response.status(), 200, scene.image)
			assert.ok(response.headers()["content-type"].includes("image/webp"))
		}
		await page.evaluate(() =>
			localStorage.setItem("jpd113-speaking-v1", "corrupt")
		)
		await page.reload()
		await page
			.getByRole("button", { name: "Bắt đầu luyện", exact: true })
			.waitFor()
		assert.equal(
			await page.getByRole("button", { name: /Tiếp tục câu/ }).count(),
			0
		)
		assert.deepEqual(errors, [])
		console.log(
			"Speaking browser check passed: filters, question/answer, fake microphone, progress/resume, review, personal, mock, mobile/dark, all 171 assets, corrupt storage; no page errors."
		)
	} finally {
		await browser.close()
	}
})().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
