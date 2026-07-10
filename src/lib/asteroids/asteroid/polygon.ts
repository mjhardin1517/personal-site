import type { Polygon } from '$lib/math';
import * as polygon from '$lib/math/polygon';
import * as vec2 from '$lib/math/vec2';

export type AsteroidGraphicConf = {
	vertices: {
		min: number;
		max: number;
	};
	radius: {
		min: number;
		max: number;
	};
	jaggedness: number;
	symmetry: number;
};

function computeAngle(i: number, numVertices: number, symmetry: number): number {
	const fullCircle = Math.PI * 2; // AKA Tau
	const evenlySpacedAngle = (i / numVertices) * fullCircle;
	const randomOffset = (Math.random() - 0.5) * symmetry; // Symmetry of 0.4 would yield -0.2 to 0.2

	// Apply the offset gives us an angle adjusted by random number from -offset to offset
	return evenlySpacedAngle + randomOffset;
}

// I think arefinement might be a weighted average on the jaggedness, so theres less of a chance
// taht it is jagged, buf if it is jagged it has a higher chance to cut in more
// OR some kind of smoothin where if last is jagged you are more likely to be jagged to stop the spikes
export function createGraphic(conf: AsteroidGraphicConf) {
	const points: Polygon = [];
	const numVertices =
		Math.floor(Math.random() * (conf.vertices.max - conf.vertices.min + 1)) + conf.vertices.min;
	const baseRadius = Math.random() * (conf.radius.max - conf.radius.min) + conf.radius.min;

	for (let i = 0; i < numVertices; i++) {
		const radius = baseRadius * (1 - Math.random() * conf.jaggedness);
		const angle = computeAngle(i, numVertices, conf.symmetry);
		// const angle = (i / numVertices) * Math.PI * 2;
		points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
	}

	const centroid = polygon.calcTrueGeometricCentroid(points);
	// Shift all points by the centroid
	return polygon.translate(points, vec2.scale(centroid, -1));
}
