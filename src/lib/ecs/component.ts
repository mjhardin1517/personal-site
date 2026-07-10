import type { World, Entity } from './data';
import * as sparseSet from '$lib/sparse-set';

/**
 * The pros of doing it this way are the fact we don't need to allocate any memory to creating the data
 * collection to then pass around. Additionally it can be exited early in a for of loop. The fact you
 * can simply for of the query in the first place is also ergonomically nice.
 * The factory function is slightly more complex, however I believe its simple enough and the ergonomics
 * nice enough that even though we're unlikely to see the performance gain at this size of a game, we
 * are going to keep it.
 */
export function* query(world: World, keys: string[]) {
	if (keys.length === 0) throw new Error('Query must contain keys');

	// Get the subset of stores for the query and locate the shortest store
	let shortestStore = keys[0];
	for (const key of keys) {
		const store = world.componentStore[key];
		if (store.dense.length < world.componentStore[shortestStore].dense.length) {
			shortestStore = key;
		}
	}

	// Iterate the shortest store
	outer: for (const entity of world.componentStore[shortestStore].dense) {
		for (const key of keys) {
			const store = world.componentStore[key];
			if (!sparseSet.has(store, entity)) {
				continue outer;
			}
		}

		yield entity;
	}
}

/**
 * Like `query`, but materializes the whole match into an array up front. This is essentially a less
 * good way of achieving the same result that a deferred-removal command buffer would give you. However,
 * it's more simple. Deferred-removal can be revisited if the pain warrants it.
 */
export function queryAll(world: World, keys: string[]): Entity[] {
	return [...query(world, keys)];
}

/** How many entities currently have `name` - the store's live size, O(1) and no allocation. */
export function count(world: World, name: string): number {
	return world.componentStore[name].dense.length;
}

export function register(world: World, name: string) {
	world.componentStore[name] = sparseSet.create<unknown>();
}

/** Assumes you know the component exists for a given entity */
export function get<U>(world: World, entity: Entity, name: string) {
	return sparseSet.get(world.componentStore[name], entity) as U;
}

export function put<U>(world: World, entity: Entity, name: string, value: U) {
	sparseSet.put(world.componentStore[name], entity, value);
}
