import type { Circle, Vec2 } from './data';
export type { Circle };

/**
 * Builds a collision Circle from a world-space position and a radius.
 */
export function at(position: Vec2, radius: number): Circle {
	return { x: position.x, y: position.y, r: radius };
}
