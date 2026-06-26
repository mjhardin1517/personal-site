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

export function remove(world: World, entity: Entity) {
	sparseSet.remove(world.activeEntities, entity);
	world.freeIds.push(entity);
}
