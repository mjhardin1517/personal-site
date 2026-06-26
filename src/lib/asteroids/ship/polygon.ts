import type { Polygon } from '$lib/math';
import * as polygon from '$lib/math/polygon';
import * as vec2 from '$lib/math/vec2';

/**
 * Asteroids Deluxe-style ship: a slender, swept-wing dart rather than the original's stubby
 * triangle. Authored in natural top-left coordinates (all positive, y down) — `createGraphic`
 * recenters it on its centroid the same way the asteroid does. Laid out nose-first along +X so
 * that at angle 0 the nose points where thrust will push. Units are local pixels at scale 1.
 *
 *   (0,2) ◤╲
 *          ╲ ╲──────────╮
 *   notch ◀ (38,83)       ●  nose (40,14)
 *          ╱ ╱──────────╯
 *   (0,26)◣╱
 *
 * Wings flare out past the hull to swept tips, with a deep V-notch between them at the tail.
 */

/** Original Asteroids ship */
// const SHIP_HULL: Polygon = [
// 	{ x: 0.0, y: -1.0 }, // nose
// 	{ x: 0.5714, y: 0.7143 }, // right rear fin tip
// 	{ x: 0.2857, y: 0.4286 }, // right notch inner
// 	{ x: -0.2857, y: 0.4286 }, // left notch inner
// 	{ x: -0.5714, y: 0.7143 }, // left rear fin tip
// ];

/** Deluxe-style ship painstakingly pulled from preview */
const SHIP_HULL: Polygon = [
	// Mainbody
	{ x: 38, y: 83 },
	{ x: 36, y: 96 },
	{ x: 89, y: 83 },
	{ x: 36, y: 70 },
	{ x: 38, y: 83 },
	// Wings
	{ x: 41, y: 101 },
	{ x: 50, y: 110 },
	{ x: 63, y: 83 },
	{ x: 50, y: 57 },
	{ x: 41, y: 66 },
	{ x: 38, y: 83 },
];

/** Returns the ship hull centered on its centroid (so it rotates about its middle), at `scale`. */
export function createGraphic(scale: number = 1): Polygon {
	const hull = polygon.scale(SHIP_HULL, scale);
	const centroid = polygon.calcTrueGeometricCentroid(hull);
	return polygon.translate(hull, vec2.scale(centroid, -1));
}
