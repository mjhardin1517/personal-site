import type { World } from '$lib/ecs';
import * as component from '$lib/ecs/component';
import * as entity from '$lib/ecs/entity';
import * as components from '../components';

/**
 * Counts each entity's Lifetime down by the step and removes it once it reaches zero.
 */
export function lifetime(world: World, dt: number) {
	const expired: number[] = [];
	for (const entityId of component.query(world, [components.LIFETIME])) {
		const life = component.get<components.Lifetime>(world, entityId, components.LIFETIME);
		life.remaining -= dt;
		if (life.remaining <= 0) expired.push(entityId);
	}

	// Expired entities are collected first and removed after the query finishes, since removal mutates
	// the very store the query is walking.
	for (const entityId of expired) {
		entity.remove(world, entityId);
	}
}
