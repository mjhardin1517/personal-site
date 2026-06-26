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
