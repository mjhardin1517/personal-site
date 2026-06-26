import type { Vec2 } from './data';

export function scale(vec2: Vec2, factor: number): Vec2 {
	return { x: vec2.x * factor, y: vec2.y * factor };
}

// `*Into` variants write the result into `out` and allocate nothing — for per-frame hot
// loops. `out` may alias an input (e.g. `addInto(pos, pos, vel)` computes `pos += vel`).
export function scaleInto(out: Vec2, vec2: Vec2, factor: number): Vec2 {
	out.x = vec2.x * factor;
	out.y = vec2.y * factor;
	return out;
}

export function add(a: Vec2, b: Vec2): Vec2 {
	return { x: a.x + b.x, y: a.y + b.y };
}

export function addInto(out: Vec2, a: Vec2, b: Vec2): Vec2 {
	out.x = a.x + b.x;
	out.y = a.y + b.y;
	return out;
}

export function distance(a: Vec2, b: Vec2): number {
	return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export function cross(a: Vec2, b: Vec2): number {
	return a.x * b.y - a.y * b.x;
}

export function normalize(vec2: Vec2): Vec2 {
	const length = Math.sqrt(vec2.x ** 2 + vec2.y ** 2);
	return { x: vec2.x / length, y: vec2.y / length };
}

export function normalizeInto(out: Vec2, vec2: Vec2): Vec2 {
	const length = Math.sqrt(vec2.x ** 2 + vec2.y ** 2);
	out.x = vec2.x / length;
	out.y = vec2.y / length;
	return out;
}
