import type { PageLoad } from "./$types"

export const load: PageLoad = ({ url }) => {
	const mode = url.searchParams.get("mode")
	return {
		mode:
			mode === "numbers"
				? ("numbers" as const)
				: mode === "vocab"
					? ("vocab" as const)
					: mode === "kana"
						? ("kana" as const)
						: null
	}
}
