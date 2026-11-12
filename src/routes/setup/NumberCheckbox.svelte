<script lang="ts">
	import type { NumberCheckboxItem } from "$/stores/game-config"
	import { numberDefinitionById } from "$/lib/numbers"
	import { gameConfig } from "$/stores/game-config"
	import { playCheckboxSelectSound } from "$/lib/sound"

	interface Props {
		item: NumberCheckboxItem
		rowIndex: number
		rowLength: number
		animationDelay?: number
		onchange?: (item: NumberCheckboxItem) => void
	}

	let {
		item,
		rowIndex,
		rowLength,
		animationDelay = 0,
		onchange
	}: Props = $props()

	let def = $derived(numberDefinitionById.get(item.id))
	let displayMode = $derived($gameConfig.numberDisplay ?? "both")

	let primaryText = $derived.by(() => {
		if (!def) return ""
		if (displayMode === "arabic") return def.arabic
		if (displayMode === "kanji") return def.kanji
		// both: show arabic as primary or kanji
		return def.arabic !== def.kanji ? `${def.arabic}` : def.kanji
	})

	let secondaryText = $derived.by(() => {
		if (!def) return ""
		if (displayMode === "arabic") return def.reading
		if (displayMode === "kanji") return def.reading
		return def.kanji !== def.arabic ? def.kanji : def.reading
	})

	let style = $derived(
		animationDelay
			? `animation-delay: ${animationDelay}ms; transition-delay: ${animationDelay}ms`
			: null
	)
</script>

{#if def}
	<button
		class="checkbox-number number-font"
		role="checkbox"
		class:selected={item.checked}
		class:is-wide={primaryText.length > 2}
		aria-checked={item.checked}
		title={`Select '${def.romaji[0]}' (${def.kanji} / ${def.arabic})`}
		{style}
		onclick={() => {
			const newChecked = !item.checked
			onchange?.({ ...item, checked: newChecked })
			playCheckboxSelectSound(rowIndex, rowLength, newChecked)
		}}
	>
		<div class="effect" aria-hidden="true">
			<div class="block">
				<span class="primary" lang="ja-JP" translate="no">{primaryText}</span>
				{#if secondaryText}
					<span class="secondary" lang="ja-JP" translate="no">
						{secondaryText}
					</span>
				{/if}
			</div>
		</div>
	</button>
{/if}

<style lang="postcss">
	.checkbox-number {
		--border-width: 3px;

		/* Reset button styles */
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		cursor: pointer;

		font-size: 1.15em;
		line-height: 1;
		white-space: nowrap;
		position: relative;
		user-select: none;
		flex-grow: 1;
		min-width: 3.8em;
	}

	.effect {
		transition: transform 30ms var(--standard-curve);
		animation-delay: inherit;
		transition-delay: inherit;
	}

	.checkbox-number:active .effect {
		transform: translateY(8%) scale(105%, 92%);
	}

	.block {
		--transition:
			125ms var(--standard-curve) color, 125ms var(--standard-curve) background,
			125ms var(--standard-curve) border-color;

		color: var(--text-color-light);
		background: var(--background-color);
		border: var(--border-width) solid var(--text-color-lighter);
		border-radius: var(--standard-border-radius);
		transition: var(--transition);
		padding: 0.35em 0.45em;
		text-align: center;
		transition-delay: inherit;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.15em;
		min-height: 2.8em;
	}

	.primary {
		font-size: 1.15em;
		font-weight: 500;
		line-height: 1.1;
	}

	.secondary {
		font-size: 0.7em;
		opacity: 0.75;
		line-height: 1;
		font-weight: 400;
	}

	.checkbox-number.selected .block {
		border-color: transparent;
		color: #ffffff;
		background: #2563eb;
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
	}

	.checkbox-number.selected .secondary {
		opacity: 0.9;
	}

	.checkbox-number:not(.selected):focus-visible .block {
		color: var(--focus-color);
		border-color: var(--focus-color);
		transition:
			var(--transition),
			75ms var(--standard-curve) color,
			75ms var(--standard-curve) border-color;
	}

	.checkbox-number.selected:focus-visible .block {
		border-color: var(--focus-color);
		transition:
			var(--transition),
			75ms var(--standard-curve) border-color;
	}
</style>
