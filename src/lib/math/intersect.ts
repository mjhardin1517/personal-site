import type { Vec2, Circle, Rect } from './data';

/** True if `point` lies within `rect` (edges inclusive). */
export function checkPointInRect(point: Vec2, rect: Rect): boolean {
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}

/** True if `circle` lies entirely within `rect`. */
export function checkCircleInRect(circle: Circle, rect: Rect): boolean {
	return (
		circle.x - circle.r >= rect.x &&
		circle.x + circle.r <= rect.x + rect.width &&
		circle.y - circle.r >= rect.y &&
		circle.y + circle.r <= rect.y + rect.height
	);
}

/** True if `circle` overlaps `rect` at all. */
export function checkCircleOverlapsRect(circle: Circle, rect: Rect): boolean {
	const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
	const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

	const dx = circle.x - closestX;
	const dy = circle.y - closestY;

	return dx * dx + dy * dy <= circle.r * circle.r;
}

/** True if the two circles overlap (touching counts as overlapping). */
export function checkCircleOverlapsCircle(a: Circle, b: Circle): boolean {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const distSq = dx * dx + dy * dy;
	const sumR = a.r + b.r;
	return distSq <= sumR * sumR;
}

/**
 * Like `checkCircleOverlapsCircle`, but on a toroidal world of size `world`: each axis is compared by its
 * shortest distance around the wrap, so circles straddling opposite edges still register as overlapping.
 * Assumes each radius is under half the world on its axis.
 */
export function checkCircleOverlapsCircleWrapped(a: Circle, b: Circle, world: Vec2): boolean {
	// Get distance on the x axis, and the size of the world in the x axis
	const dx = wrappedDelta(b.x - a.x, world.x);
	const dy = wrappedDelta(b.y - a.y, world.y);
	const sumR = a.r + b.r;
	return dx * dx + dy * dy <= sumR * sumR;
}

/** Shortest signed distance between two coordinates on an axis that wraps every `size`. */
function wrappedDelta(delta: number, size: number): number {
	// Math.round(delta / size) is computing the number of times it has wrapped "size". Multiplying by
	// size gives you the true distance. When you subtract it from delta, you get a signed distance
	// factoring in the wrap.
	return delta - size * Math.round(delta / size);
}
