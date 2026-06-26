import type { World } from './data';
import * as sparseSet from '$lib/sparse-set';

export function create(): World {
	return {
		nextId: 0,
		freeIds: [],
		activeEntities: sparseSet.create(),
		componentStore: {},
		resources: {},
		updateSystems: [],
		renderSystems: [],
	};
}

/** Advance the simulation by one fixed step. `dt` is constant (see the fixed-timestep loop). */
export function update(world: World, dt: number) {
	for (const system of world.updateSystems) {
		system(world, dt);
	}
}

/** Draw one frame. `alpha` (0..1) interpolates between the last two simulation steps. */
export function render(world: World, alpha: number) {
	for (const system of world.renderSystems) {
		system(world, alpha);
	}
}
