import type { World, System } from './data';

/** Register a system on the fixed-step simulation schedule. */
export function put(world: World, system: System) {
	world.updateSystems.push(system);
}

/** Register a system on the per-frame render schedule (receives `alpha`, not `dt`). */
export function putRender(world: World, system: System) {
	world.renderSystems.push(system);
}
