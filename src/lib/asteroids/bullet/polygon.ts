import type { Polygon } from '$lib/math';

/** We're aiming for a glowing dot, starting with a small diamond with the phosphor bloom. */
const BULLET: Polygon = [
	{ x: 2, y: 0 },
	{ x: 0, y: 2 },
	{ x: -2, y: 0 },
	{ x: 0, y: -2 },
];

export function createGraphic(): Polygon {
	return BULLET;
}
