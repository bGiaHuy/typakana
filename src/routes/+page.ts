import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ fetch }) => {
	// Optional repository metadata must not prevent access to practice modules.
	try {
		const res = await fetch("https://api.github.com/repos/furudean/type-kana", {
			signal: AbortSignal.timeout(3000)
		})
		if (!res.ok) return { stargazers: 0 }
		const { stargazers_count } = await res.json()
		return {
			stargazers: typeof stargazers_count === "number" ? stargazers_count : 0
		}
	} catch {
		return { stargazers: 0 }
	}
}
