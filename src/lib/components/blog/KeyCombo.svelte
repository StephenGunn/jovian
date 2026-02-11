<script lang="ts">
	interface Props {
		keys?: string;
		held?: string;
		label: string;
		kbd?: string;
		cancelled?: boolean;
	}

	let { keys = '', held = '', label, kbd = '', cancelled = false }: Props = $props();

	// Parse comma-separated strings to arrays
	const keyArray = keys ? keys.split(',').map(n => parseInt(n.trim())) : [];
	const heldArray = held ? held.split(',').map(n => parseInt(n.trim())) : [];
	const kbdArray = kbd ? kbd.split(',').map(k => k.trim()) : [];

	// 36-key split layout positions
	const keyPositions: [number, number][] = [
		// Row 0 (top)
		[30, 28], [90, 28], [150, 28], [210, 28], [270, 28],
		[360, 28], [420, 28], [480, 28], [540, 28], [600, 28],
		// Row 1 (home)
		[30, 84], [90, 84], [150, 84], [210, 84], [270, 84],
		[360, 84], [420, 84], [480, 84], [540, 84], [600, 84],
		// Row 2 (bottom)
		[30, 140], [90, 140], [150, 140], [210, 140], [270, 140],
		[360, 140], [420, 140], [480, 140], [540, 140], [600, 140],
		// Row 3 (thumb)
		[150, 196], [210, 196], [270, 196],
		[360, 196], [420, 196], [480, 196],
	];

	const keyWidth = 56;
	const keyHeight = 52;
	const keyRadius = 6;

	function getKeyClass(index: number): string {
		if (heldArray.includes(index)) return 'held';
		if (keyArray.includes(index)) return 'active';
		return '';
	}
</script>

<figure class="key-combo" class:cancelled>
	<svg viewBox="0 0 630 224" class="keyboard" xmlns="http://www.w3.org/2000/svg">
		{#each keyPositions as [x, y], i}
			<rect
				x={x - keyWidth / 2}
				y={y - keyHeight / 2}
				width={keyWidth}
				height={keyHeight}
				rx={keyRadius}
				ry={keyRadius}
				class="key {getKeyClass(i)}"
			/>
		{/each}
	</svg>
	<figcaption>
		{#if kbdArray.length > 0}
			<span class="keys">
				{#each kbdArray as key, i}
					<kbd>{key}</kbd>{#if i < kbdArray.length - 1}<span class="plus">+</span>{/if}
				{/each}
			</span>
			<span class="separator">→</span>
		{/if}
		<span class="label">{label}</span>
	</figcaption>
</figure>

<style>
	.key-combo {
		border-radius: 0.5rem;
		border: 1px solid var(--bg-accent-1);
		padding: 1rem;
		margin: 1rem 0;
		background: radial-gradient(
			circle,
			rgba(24, 23, 29, 0.3) 0%,
			rgba(22, 20, 28, 0.3) 100%
		);
	}

	.keyboard {
		width: 100%;
		max-width: 500px;
		height: auto;
		display: block;
		margin: 0 auto;
	}

	.key {
		fill: var(--bg-accent-1);
		fill-opacity: 0.4;
		stroke: var(--muted-color);
		stroke-opacity: 0.3;
		stroke-width: 1;
	}

	.key.active {
		fill: var(--primary);
		fill-opacity: 0.7;
		stroke: var(--primary);
		stroke-opacity: 0.8;
	}

	.key.held {
		fill: var(--secondary);
		fill-opacity: 0.5;
		stroke: var(--secondary);
		stroke-opacity: 0.7;
	}

	.cancelled .key.active,
	.cancelled .key.held {
		fill: var(--error, #e74c3c);
		fill-opacity: 0.5;
		stroke: var(--error, #e74c3c);
		stroke-opacity: 0.7;
	}

	figcaption {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}

	.keys {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	kbd {
		background: var(--bg-accent-1);
		border: 1px solid var(--bg-accent-2);
		border-radius: 4px;
		padding: 0.2rem 0.5rem;
		font-family: inherit;
		font-size: 0.85rem;
		color: var(--font-color);
		box-shadow: 0 2px 0 var(--bg-accent-2);
	}

	.plus {
		color: var(--muted-color);
		font-size: 0.8rem;
	}

	.separator {
		color: var(--muted-color);
		margin: 0 0.25rem;
	}

	.label {
		color: var(--font-color);
		font-size: 0.95rem;
	}

	.cancelled .label {
		text-decoration: line-through;
		color: var(--error, #e74c3c);
	}

	.cancelled kbd {
		border-color: var(--error, #e74c3c);
		color: var(--error, #e74c3c);
	}

	@media (max-width: 600px) {
		.keyboard {
			max-width: 100%;
		}

		figcaption {
			flex-direction: column;
			gap: 0.5rem;
		}

		.separator {
			display: none;
		}
	}
</style>
