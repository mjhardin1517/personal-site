<script lang="ts">
	import '$lib/styles/fonts.css';
	import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Canvas } from '$lib/canvas';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Canvas />
<div class="grid-bg"></div>
<div class="crt"></div>

{@render children()}

<style>
	.grid-bg {
		position: fixed;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		/**
		 * Create our graticule grid lines. Transparent color stop line keeps the main grid line from
		 * from stretching. Background size is defining our tile which gets repeated.
		 */
		background-image:
			linear-gradient(var(--grid) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid) 1px, transparent 1px);
		background-size: 44px 44px;
	}

	.crt {
		position: fixed;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		/**
		 * We're doing something similar to grid-bg but using repeating linear gradient instead. This
	     * will create a dark semi-transparent line for 1px, then transparent for 2px, repeaeting...
		 */
		background: repeating-linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.18) 0px,
			rgba(0, 0, 0, 0.18) 1px,
			transparent 1px,
			transparent 3px
		);
		/**
		 * Never used this prop before. Multiply will blend the scanline effect with the background
		 * behind it. The idea is we're trying to make it NOT look like the scanlines are merely sitting
		 * on top of the background.
		 */
		mix-blend-mode: multiply;
	}

	/**
	 * Simple vignette effect
	 */
	.crt::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
	}
</style>
