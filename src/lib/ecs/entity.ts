import type { Entity, World } from './data';
import * as sparseSet from '$lib/sparse-set';

export function create(world: World): Entity {
	let id: number;
	if (world.freeIds.length > 0) {
		id = world.freeIds.pop() as number;
	} else {
		id = world.nextId;
		world.nextId++;
	}

	sparseSet.put(world.activeEntities, id, id);
	return id;
}

/**
 * Removes an entity entirely by stripping it from every component store, drops it from the live-entity
 * set, and frees its id for reuse. Clearing the stores first makes id recycling safe; otherwise a reused
 * id would inherit the previous entity's components.
 */
export function remove(world: World, entity: Entity) {
	for (const store of Object.values(world.componentStore)) {
		sparseSet.remove(store, entity);
	}
	sparseSet.remove(world.activeEntities, entity);
	world.freeIds.push(entity);
}
