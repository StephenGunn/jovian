<script lang="ts">
	import keymapSvg from '$lib/assets/keymap.svg?raw';
</script>

<figure class="keymap-figure">
	<div class="keymap-wrapper">
		{@html keymapSvg}
	</div>
	<figcaption>Current 36-key layout with homerow mods</figcaption>
</figure>

<style>
	.keymap-figure {
		border-radius: 0.5rem;
		border: 1px solid var(--bg-accent-1);
		padding: 1.5rem;
		margin: 1.5rem 0;
		background: radial-gradient(
			circle,
			rgba(24, 23, 29, 0.5) 0%,
			rgba(22, 20, 28, 0.5) 100%
		);
	}

	.keymap-figure figcaption {
		margin-top: 1rem;
		font-size: 0.9rem;
		color: var(--accent);
		text-align: center;
		font-style: italic;
	}

	.keymap-wrapper {
		width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	/* SVG container - full width */
	.keymap-wrapper :global(svg.keymap) {
		width: 100%;
		height: auto;
		display: block;
		font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
	}

	/* Key backgrounds */
	.keymap-wrapper :global(rect.key) {
		fill: var(--bg-accent-1);
		fill-opacity: 0.6;
		transition: fill-opacity 0.15s ease;
	}

	.keymap-wrapper :global(rect.key:hover) {
		fill-opacity: 0.85;
	}

	/* Key strokes */
	.keymap-wrapper :global(rect.key),
	.keymap-wrapper :global(rect.combo) {
		stroke: var(--muted-color);
		stroke-opacity: 0.4;
		stroke-width: 1;
	}

	/* Combo boxes */
	.keymap-wrapper :global(rect.combo),
	.keymap-wrapper :global(rect.combo-separate) {
		fill: var(--highlight);
		fill-opacity: 0.25;
	}

	/* Held keys */
	.keymap-wrapper :global(rect.held),
	.keymap-wrapper :global(rect.combo.held) {
		fill: var(--primary);
		fill-opacity: 0.4;
	}

	/* All text */
	.keymap-wrapper :global(text) {
		fill: var(--font-color);
	}

	/* Layer labels - keep visible */
	.keymap-wrapper :global(text.label),
	.keymap-wrapper :global(text.label:hover) {
		fill: var(--secondary) !important;
		stroke: var(--bg) !important;
		stroke-width: 4px;
		paint-order: stroke;
		font-weight: bold;
		pointer-events: none;
	}

	/* Hold/modifier text below keys */
	.keymap-wrapper :global(text.hold) {
		fill: var(--primary);
		font-size: 10px;
	}

	/* Transparent/passthrough keys */
	.keymap-wrapper :global(text.trans) {
		fill: var(--muted-color);
	}

	/* Shifted key labels */
	.keymap-wrapper :global(text.shifted) {
		fill: var(--highlight);
	}

	/* SVG anchor links - override blog.css */
	.keymap-wrapper :global(a) {
		display: inline;
		position: static;
	}

	.keymap-wrapper :global(a::before),
	.keymap-wrapper :global(a::after) {
		display: none !important;
		content: none !important;
	}

	/* Layer activator text */
	.keymap-wrapper :global(text.layer-activator),
	.keymap-wrapper :global(a:hover text.layer-activator) {
		fill: var(--secondary);
		text-decoration: underline;
		text-decoration-color: var(--secondary);
	}

	.keymap-wrapper :global(a:hover text.layer-activator) {
		fill: var(--highlight);
	}

	/* Combo connection lines */
	.keymap-wrapper :global(path.combo) {
		stroke: var(--muted-color);
	}

	@media (max-width: 768px) {
		.keymap-figure {
			padding: 1rem;
			margin: 1rem 0;
		}
	}
</style>
