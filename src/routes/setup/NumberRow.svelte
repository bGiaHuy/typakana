<script lang="ts">
	import type { NumberCheckboxRow } from "$/stores/game-config"
	import { playCheckboxSelectSeriesSound } from "$/lib/sound"
	import Checkbox from "$/components/Checkbox.svelte"
	import NumberCheckbox from "./NumberCheckbox.svelte"

	interface Props {
		row: NumberCheckboxRow
		animationDelay?: number
	}

	let { row = $bindable(), animationDelay: columnAnimationDelay = 0 }: Props =
		$props()
	let animationDelay = $state(0)

	function isRowSelected(r: NumberCheckboxRow): boolean {
		return r.length > 0 && r.every((item) => item.checked)
	}

	function selectRow(state: boolean) {
		animationDelay = 20
		row = row.map((item) => ({ ...item, checked: state }))
	}
</script>

<div class="row" role="row">
	<Checkbox
		title="Select row"
		checked={isRowSelected(row)}
		indeterminate={!isRowSelected(row) && row.some((item) => item.checked)}
		onclick={() => {
			const newState = !isRowSelected(row)
			const diffItems = row.filter((item) => item.checked !== newState)
			const toPlay = Math.min(diffItems.length, 4)
			playCheckboxSelectSeriesSound(toPlay, newState)
			selectRow(newState)
		}}
	/>
	<div class="row-items">
		{#each row as item, index (item.id)}
			<NumberCheckbox
				{item}
				rowIndex={index}
				rowLength={row.length}
				animationDelay={columnAnimationDelay || animationDelay * index}
				onchange={(newItem) => {
					row = row.map((r, i) => (i === index ? newItem : r))
				}}
			/>
		{/each}
	</div>
</div>

<style lang="postcss">
	.row {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
		width: 100%;
	}

	:global(.row .checkbox) {
		margin-right: 15px;
		font-size: 1.25em;
		flex-shrink: 0;
	}

	.row-items {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		flex-grow: 1;
	}
</style>
