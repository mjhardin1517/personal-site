<script lang="ts">
	import { onMount } from 'svelte';
	import { phosphorGlow } from '$lib/styles/tokens';
	import type { World } from '$lib/ecs';
	import * as world from '$lib/ecs/world';
	// import type { Polygon } from '$lib/math';
	import { newGame, bindInput } from '$lib/asteroids';
	let canvas: HTMLCanvasElement | undefined = $state();

	type CanvasInfo = {
		dpr: number;
		logicalWidth: number;
		logicalHeight: number;
	};

	/**
	 * Canvas has two sizes, it's internal pixel buffer (backing store) and the display size. We set
	 * the backing store to match the display size so it will not get stretched and appear blurry on
	 * high-DPI screens. `canvas.width` and `canvas.height` are the backing store size, while `style.width`
	 * and `style.height` are the display size.
	 * To scale the backing store properly, we need the device pixel ratio (DPR), which is the amount
	 * of physical pixels used to draw one logical (CSS) pixel. A DPR of 2 means 1 CSS pixel is drawn
	 * using 2x2 physical pixels.
	 *
	 * @param canvas Mutable reference to the canvas element.
	 * @param ctx The 2D canvas rendering context.
	 * @returns The device pixel ratio.
	 */
	function scaleCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): CanvasInfo {
		// Capping as there is a drop off in benefit, 3 could be justified on phones though
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		// This is the CSS display size
		const rect = canvas.getBoundingClientRect();

		// Math.round becaause rect can be fractional and cause integer truncation issues resulting
		// in visible seams on the edges of the canvas
		canvas.width = Math.round(rect.width * dpr);
		canvas.height = Math.round(rect.height * dpr);
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		return {
			dpr,
			logicalWidth: rect.width,
			logicalHeight: rect.height,
		};
	}

	// The amount of time in seconds to advance the simulation by every tick.
	const FIXED_DT = 1 / 120;
	// If we don't cap the elapsed time, large lag or switching tabs and coming back will blow up the fixed physics loop.
	const MAX_FRAME_TIME = 0.25;
	// Result of request animation frame so we can canel
	let rafId: number | undefined;
	// Last real time
	let last: number = performance.now();
	// Aggregates elapsed time since last frame
	let accumulator = 0;

	function frame(
		worldState: World,
		now: number,
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
	) {
		// Get the frame time in seconds - no greater than the max frame time.
		const frameTime = Math.min((now - last) / 1000, MAX_FRAME_TIME);
		last = now;
		accumulator += frameTime;

		// Perform physics updates until we are caught up.
		while (accumulator >= FIXED_DT) {
			world.update(worldState, FIXED_DT);
			accumulator -= FIXED_DT;
		}

		// Leftover time as a fraction of a step => how far between the last two sim states we are.
		const alpha = accumulator / FIXED_DT;

		// Clear opaquely first; it's important to clear before drawing for the glow effect.
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = phosphorGlow;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Additive blend enhances the glow where strokes overlap.
		ctx.globalCompositeOperation = 'lighter';
		world.render(worldState, alpha);

		// Reset, request new frame.
		ctx.globalCompositeOperation = 'source-over';
		rafId = requestAnimationFrame((now) => frame(worldState, now, canvas, ctx));
	}

	onMount(() => {
		if (canvas === undefined) return;
		const ctx = canvas.getContext('2d');
		if (ctx === null) return;

		const canvasInfo = scaleCanvas(canvas, ctx);
		const worldState = newGame({
			canvasCtx: ctx,
			worldSize: { x: canvasInfo.logicalWidth, y: canvasInfo.logicalHeight },
		});
		const unbindInput = bindInput(worldState);
		rafId = requestAnimationFrame((now) => {
			if (canvas !== undefined) frame(worldState, now, canvas, ctx);
		});

		return () => {
			if (rafId !== undefined) cancelAnimationFrame(rafId);
			unbindInput();
		};
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		display: block;
	}
</style>
