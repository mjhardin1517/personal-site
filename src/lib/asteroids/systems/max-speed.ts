import type { World } from '$lib/ecs';
import * as component from '$lib/ecs/component';
import * as components from '../components';

/**
 * Clamps an entity's speed MaxSpeed.value, leaving direction untouched.
 */
export function maxSpeed(world: World) {
	for (const entity of component.query(world, [components.VELOCITY, components.MAX_SPEED])) {
		const velocity = component.get<components.Velocity>(world, entity, components.VELOCITY);
		const limit = component.get<components.MaxSpeed>(world, entity, components.MAX_SPEED).value;
		const speedSq = velocity.x * velocity.x + velocity.y * velocity.y;
		if (speedSq > limit * limit) {
			const scale = limit / Math.sqrt(speedSq);
			velocity.x *= scale;
			velocity.y *= scale;
		}
	}
}
