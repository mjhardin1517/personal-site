import type { Vec2, Polygon } from './data';
import * as vec2 from './vec2';

export function scale(polygon: Polygon, factor: number): Polygon {
	const newPolygon: Polygon = [];
	for (const vertex of polygon) {
		newPolygon.push(vec2.scale(vertex, factor));
	}
	return newPolygon;
}

export function translate(polygon: Polygon, newPosition: Vec2): Polygon {
	const newPolygon: Polygon = [];
	for (const vertex of polygon) {
		newPolygon.push(vec2.add(vertex, newPosition));
	}
	return newPolygon;
}

export function calcLargestRadius(polygon: Polygon, centroid: Vec2): number {
	let largestRadius = 0;
	for (const vertex of polygon) {
		const distance = vec2.distance(vertex, centroid);
		if (distance > largestRadius) {
			largestRadius = distance;
		}
	}
	return largestRadius;
}

export function calcTrueGeometricCentroid(polygon: Polygon): Vec2 {
	let area = 0;
	let c: Vec2 = { x: 0, y: 0 };
	const numVertices = polygon.length;

	for (let i = 0; i < numVertices; i++) {
		const current = polygon[i];
		// When i + 1 would be equal to numVertices, it loops back to the first vertex
		const next = polygon[(i + 1) % numVertices];
		const factor = vec2.cross(current, next);
		area += factor;
		c = vec2.add(c, vec2.scale(vec2.add(current, next), factor));
	}

	area = area / 2;

	// Guard against zero-area polygons (e.g., all points in a straight line)
	if (area === 0) return { x: 0, y: 0 };

	return vec2.scale(c, 1 / (6 * area));
}

export function rotateAround(polygon: Polygon, angle: number, c: Vec2): Polygon {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const newPolygon: Polygon = [];

	for (const { x, y } of polygon) {
		const dx = x - c.x;
		const dy = y - c.y;

		newPolygon.push({
			x: c.x + dx * cos - dy * sin,
			y: c.y + dx * sin + dy * cos,
		});
	}

	return newPolygon;
}
