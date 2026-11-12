export type Rating = "remembered" | "review"
export type SpeakingSession = {
	ratings: Record<string, Rating>
	queue: string[]
	index: number
}

export function readSession(
	raw: string | null,
	validIds: string[]
): SpeakingSession {
	const empty: SpeakingSession = { ratings: {}, queue: [], index: 0 }
	try {
		const value = JSON.parse(raw ?? "null")
		if (!value || typeof value !== "object") return empty
		const valid = new Set(validIds)
		const ratings: Record<string, Rating> = {}
		for (const [id, rating] of Object.entries(value.ratings ?? {})) {
			if (valid.has(id) && (rating === "remembered" || rating === "review")) {
				ratings[id] = rating
			}
		}
		// Keep the cursor only when the entire saved queue still belongs to this deck.
		const queue: string[] =
			Array.isArray(value.queue) &&
			value.queue.every(
				(id: unknown) => typeof id === "string" && valid.has(id)
			)
				? [...new Set<string>(value.queue)]
				: []
		const index =
			Number.isInteger(value.index) &&
			value.index >= 0 &&
			value.index <= queue.length
				? value.index
				: 0
		return { ratings, queue, index }
	} catch {
		return empty
	}
}

export function selectQuestions<T extends { id: string; sceneId: string }>(
	questions: T[],
	sceneIds: string[],
	ratings: Record<string, Rating>,
	mode: "all" | "review" | "unseen"
): T[] {
	const scenes = new Set(sceneIds)
	return questions.filter(
		(q) =>
			scenes.has(q.sceneId) &&
			(mode === "all" ||
				(mode === "review" ? ratings[q.id] === "review" : !ratings[q.id]))
	)
}
