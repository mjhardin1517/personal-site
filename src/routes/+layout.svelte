<script lang="ts">
	import '$lib/styles/fonts.css';
	import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<canvas id="scope"></canvas>
<div class="grid-bg"></div>
<div class="crt"></div>

{@render children()}

<style>
	.grid-bg {
		position: fixed;
		inset: 0;
		z-index: 1;
		pointer-events: none;
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
		background: repeating-linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.18) 0px,
			rgba(0, 0, 0, 0.18) 1px,
			transparent 1px,
			transparent 3px
		);
		mix-blend-mode: multiply;
	}

	.crt::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
	}
</style>
