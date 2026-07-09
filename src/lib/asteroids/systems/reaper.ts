import type { World } from '$lib/ecs';
import * as component from '$lib/ecs/component';
import * as entity from '$lib/ecs/entity';
import * as components from '../components';

/**
 * Removes every entity stamped Collided this step. Runs LAST, after the reaction systems have taken
 * their side effects (a rock spawning its children, the ship its death), so those get a chance to read
 * the doomed entity before it's gone.
 *
 * For now "Collided" effectively means "dead". Will need to re-evaluate if that ever changes. Also,
 * we're not specifically clearing the collision components here for that reason; all collisions are
 * dead, so the entity is removed.
 */
export function reaper(world: World) {
	// Snapshot first: entity.remove mutates the very store the query walks.
	const doomed = component.queryAll(world, [components.COLLIDED]);

	for (const dead of doomed) {
		entity.remove(world, dead);
	}
}
