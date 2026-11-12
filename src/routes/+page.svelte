<script lang="ts">
	import Header from "./Header.svelte"
	import Button from "$/components/Button.svelte"
	import Icon from "$/components/MaterialIcon.svelte"
	import { mdiArrowRight, mdiNumeric, mdiTranslate } from "@mdi/js"

	interface Props {
		data: { stargazers: number }
	}

	let { data }: Props = $props()
	let stargazers = $derived(data.stargazers)
</script>

<svelte:head>
	<title>Type Kana</title>
</svelte:head>

<Header {stargazers} />
<section class="content-padding">
	<div class="content-width center">
		<p>
			Type Kana is a quiz app to help you learn hiragana, katakana, Japanese
			counting numbers, and Japanese vocabulary (từ vựng Bài 1–3 sang tiếng
			Việt).
		</p>

		<div class="buttons">
			<Button href="/speaking">Luyện Speaking JPD113 (theo ảnh)</Button>
			<Button href="/reading">Luyện đọc Romaji</Button>
			<Button href="/kanji">Luyện Kanji (Bài 1–3)</Button>
			<Button href="/setup?mode=vocab">
				Luyện Từ vựng (Bài 1–3)
				<Icon size="1.25em" path={mdiTranslate} />
			</Button>
			<Button href="/setup?mode=numbers" style="outline">
				Luyện Số đếm
				<Icon size="1.25em" path={mdiNumeric} />
			</Button>
			<Button href="/setup?mode=kana" style="outline">
				Luyện Bảng Kana
				<Icon size="1.25em" path={mdiArrowRight} />
			</Button>
		</div>
	</div>
</section>

<style lang="postcss">
	.buttons {
		display: flex;
		gap: 1em;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 1.5em;
	}

	* :global(.button .svg-icon) {
		margin-right: -0.5em;
	}
</style>
