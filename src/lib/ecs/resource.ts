import type { World } from './data';

export function put<T>(world: World, key: string, value: T) {
	world.resources[key] = value;
}

export function get<U>(world: World, key: string): U {
	return world.resources[key] as U;
}
