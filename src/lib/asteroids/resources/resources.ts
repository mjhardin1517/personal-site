import type { Vec2 } from '$lib/math';

export type WorldSize = Vec2;

export const WORLD_SIZE = 'world_size';

export type CanvasCtx = CanvasRenderingContext2D;

export const CANVAS_CTX = 'canvas_ctx';

export type Color = string;

export const COLOR = 'color';

/** Discrete, edge-triggered player actions (one per physical press), as opposed to held state. */
export type InputAction = 'fire';

/**
 * Semantic player input, decoupled from whichever physical keys produced it. The keyboard binding
 * writes it; the player-control system reads it. Swapping in a gamepad later means rewriting only
 * the binding, not the system.
 *
 * Two flavors of input:
 * - Held *levels* (`left`/`right`/`thrust`): "is this control active right now?" Sampled each step.
 * - Discrete *events* (`queue`): "this happened once." Enqueued on keydown, drained once per step so
 *   a single tap fires exactly once no matter how many fixed steps a frame runs.
 */
export type Input = {
	left: boolean;
	right: boolean;
	thrust: boolean;
	queue: InputAction[];
};

export const INPUT = 'input';

export function createInput(): Input {
	return { left: false, right: false, thrust: false, queue: [] };
}
