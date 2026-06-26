import type { World } from '$lib/ecs';
import * as component from '$lib/ecs/component';
import * as resource from '$lib/ecs/resource';
import * as components from '../components';
import * as resources from '../resources';
import * as intersect from '$lib/math/intersect';

/**
 * Toroidal wrapping. Assumes transform has already moved entities this frame.
 *
 * An entity wraps on an axis only where its bounding circle pokes past an edge *while moving
 * outward through that edge*. The outward check keeps entities that are still drifting in from
 * a spawn edge from wrapping before they've entered.
 *
 * While the circle straddles an edge we expose a ghost copy on the opposite side so the crossing
 * reads as seamless; once the circle is fully past the edge we relocate the canonical position to
 * the far side.
 */
export function wrap(world: World) {
	const worldSize = resource.get<resources.WorldSize>(world, resources.WORLD_SIZE);
	const worldRect = { x: 0, y: 0, width: worldSize.x, height: worldSize.y };
	const query = component.query(world, [
		components.TRANSFORM,
		components.VELOCITY,
		components.WRAP,
		components.CIRCLE,
		components.PREVIOUS_TRANSFORM,
	]);
	for (const entity of query) {
		const transform = component.get<components.Transform>(world, entity, components.TRANSFORM);
		const velocity = component.get<components.Velocity>(world, entity, components.VELOCITY);
		const wrap = component.get<components.Wrap>(world, entity, components.WRAP);
		const { radius } = component.get<components.Circle>(world, entity, components.CIRCLE);
		const previous = component.get<components.PreviousTransform>(
			world,
			entity,
			components.PREVIOUS_TRANSFORM,
		);

		wrap.isWrapping = false;
		wrap.ghosts.length = 0;

		// Fully inside the world: nothing to wrap.
		const entityCircle = { x: transform.x, y: transform.y, r: radius };
		if (intersect.checkCircleInRect(entityCircle, worldRect)) continue;

		const ax = wrapAxis(transform.x, velocity.x, radius, worldRect.x, worldRect.width);
		const ay = wrapAxis(transform.y, velocity.y, radius, worldRect.y, worldRect.height);

		// Opposite-side ghost copies (including the corner copy when both axes wrap). Built from
		// the pre-relocation position so each ghost lines up with the straddling body.
		for (const sx of ax.shift ? [0, ax.shift] : [0]) {
			for (const sy of ay.shift ? [0, ay.shift] : [0]) {
				if (sx === 0 && sy === 0) continue;
				wrap.ghosts.push({ x: transform.x + sx, y: transform.y + sy });
			}
		}
		wrap.isWrapping = wrap.ghosts.length > 0;

		// Once the body is fully past an edge, move the canonical position to the far side. Shift the
		// interpolation snapshot by the same delta so prev and current stay in one coordinate frame
		// — otherwise the renderer would lerp across the whole world and streak the body on the wrap.
		const dx = ax.pos - transform.x;
		const dy = ay.pos - transform.y;
		transform.x = ax.pos;
		transform.y = ay.pos;
		previous.x += dx;
		previous.y += dy;
	}
}

type AxisWrap = { shift: number; pos: number };

/**
 * Checks whether an entity is leaving an axial aligned segment outside the min or max.
 * @param pos The current position of an entity
 * @param vel the current velocity of an entity
 * @param radius the radius of the entity's bounding circle
 * @param min The minimum of the line segment the entity is traveling on
 * @param size The size of the line segment the entity is traveling on
 * @returns `shift` — offset to the opposite side for the ghost (0 when not wrapping), and `pos` —
 *          the canonical position, relocated to the far side once the circle is fully past the edge.
 */
function wrapAxis(pos: number, vel: number, radius: number, min: number, size: number): AxisWrap {
	const max = min + size;
	// Leaving through the far edge (poking past max while moving outward).
	if (pos + radius > max && vel > 0) {
		return { shift: -size, pos: pos - radius > max ? pos - size : pos };
	}
	// Leaving through the near edge.
	if (pos - radius < min && vel < 0) {
		return { shift: size, pos: pos + radius < min ? pos + size : pos };
	}
	return { shift: 0, pos };
}
