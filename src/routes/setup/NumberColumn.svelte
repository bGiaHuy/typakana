<script lang="ts">
	import type { NumberCheckboxColumn } from "$/stores/game-config"
	import { playCheckboxSelectSeriesSound } from "$/lib/sound"
	import Checkbox from "$/components/Checkbox.svelte"
	import NumberRow from "./NumberRow.svelte"

	interface Props {
		rows: NumberCheckboxColumn
		label: string
		description?: string
	}

	let { rows = $bindable(), label, description }: Props = $props()

	let animationDelay = $state(0)

	function isAllSelected(r: NumberCheckboxColumn): boolean {
		return r.length > 0 && r.every((row) => row.every((item) => item.checked))
	}

	function isIndeterminate(r: NumberCheckboxColumn): boolean {
		const all = isAllSelected(r)
		const any = r.some((row) => row.some((item) => item.checked))
		return !all && any
	}

	function selectAll(state: boolean) {
		animationDelay = 15
		rows = rows.map((row) => row.map((item) => ({ ...item, checked: state })))
	}
</script>

<section class="column">
	<div class="select-all">
		<label>
			<Checkbox
				checked={isAllSelected(rows)}
				indeterminate={isIndeterminate(rows)}
				onclick={() => {
					const newState = !isAllSelected(rows)
					selectAll(newState)
					playCheckboxSelectSeriesSound(8, newState)
				}}
			/>
			<div class="header-text">
				<h2>{label}</h2>
				{#if description}
					<span class="desc">{description}</span>
				{/if}
			</div>
		</label>
	</div>
	{#each rows as _row, index (index)}
		<NumberRow bind:row={rows[index]} animationDelay={animationDelay * index} />
	{/each}
</section>

<style lang="postcss">
	h2 {
		all: inherit;
		margin: 0;
		font-weight: 600;
	}

	.column {
		display: flex;
		flex-direction: column;
		margin-bottom: 2.5em;
		background: var(--surface-2, rgba(255, 255, 255, 0.03));
		border: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.08));
		border-radius: var(--standard-border-radius, 12px);
		padding: 1.25em;
		box-sizing: border-box;
		min-width: 280px;
		max-width: 480px;
	}

	.select-all {
		user-select: none;
		margin-bottom: 1.25em;
		padding-bottom: 0.75em;
		border-bottom: 1px solid
			var(--background-contrast-light, rgba(255, 255, 255, 0.06));
	}

	.select-all label {
		display: flex;
		flex-direction: row;
		align-items: center;
		cursor: pointer;
	}

	.header-text {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
	}

	.desc {
		font-size: 0.85em;
		color: var(--text-color-light);
		opacity: 0.8;
	}

	.column :global(.select-all .checkbox) {
		margin-right: 15px;
		font-size: 1.25em;
	}
</style>
