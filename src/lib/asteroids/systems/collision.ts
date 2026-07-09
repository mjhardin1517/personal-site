import type { World, Entity } from '$lib/ecs';
import * as component from '$lib/ecs/component';
import * as circle from '$lib/math/circle';
import * as intersect from '$lib/math/intersect';
import * as components from '../components';

/**
 * Detects hit/hurt overlaps and stamps both parties with Collided. A Hitbox strikes a Hurtbox only
 * when the Hitbox's `targets` include the Hurtbox's `layer`. This system does not decide what to do
 * after collisions, that's left to downstream systems.
 *
 * RUNS AFTER TRANSFORM AND WRAP so positions are final. It's O(hitboxes × hurtboxes), which at Asteroids
 * scale (a handful of rocks, a few shots) is trivially cheap. So no spatial broad-phase needed.
 */
export function collision(world: World) {
	// Materialize hurtboxes once; we scan them for every hitbox.
	const victims = component.queryAll(world, [components.HURTBOX, components.TRANSFORM]);

	// Collect first, stamp after - keeps detection a pure read pass and mutation a separate write pass.
	const hits: Entity[] = [];

	for (const aggressor of component.query(world, [components.HITBOX, components.TRANSFORM])) {
		// Aggressor (getting their circle)
		const hitbox = component.get<components.Hitbox>(world, aggressor, components.HITBOX);
		const aggressorTransform = component.get<components.Transform>(
			world,
			aggressor,
			components.TRANSFORM,
		);
		const strike = circle.at(aggressorTransform, hitbox.radius);

		// Victim
		for (const victim of victims) {
			// Ignore self
			if (victim === aggressor) continue;

			// Ignore if aggressor and victim are not part of the same layer
			const hurtbox = component.get<components.Hurtbox>(world, victim, components.HURTBOX);
			if (!hitbox.targets.includes(hurtbox.layer)) continue;

			// Get the victim's circle
			const victimTransform = component.get<components.Transform>(
				world,
				victim,
				components.TRANSFORM,
			);
			const vulnerable = circle.at(victimTransform, hurtbox.radius);

			// Check if victim and aggressor overlap
			if (intersect.checkCircleOverlapsCircle(strike, vulnerable)) {
				hits.push(aggressor, victim);
			}
		}
	}

	// Add the collided component for every hit
	for (const hit of hits) {
		component.put<components.Collided>(world, hit, components.COLLIDED, {});
	}
}
