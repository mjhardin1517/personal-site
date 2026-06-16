<script lang="ts">
	import { onMount } from 'svelte';
	let canvas: HTMLCanvasElement | undefined = $state();

	onMount(() => {
		if (canvas === undefined) return;
		const ctx = canvas.getContext('2d');
		if (ctx === null) return;
		ctx.fillStyle = 'red';
		ctx.fillRect(10, 10, 100, 100);
	});
</script>

<canvas bind:this={canvas}></canvas>
