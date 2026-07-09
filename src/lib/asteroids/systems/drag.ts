import type { World } from '$lib/ecs';
import * as component from '$lib/ecs/component';
import * as components from '../components';

/**
 * Deluxe style decaying velocity (mainly for the ship). `exp(-k·dt)` so the decay rate is identical at any step size.
 */
export function drag(world: World, dt: number) {
	for (const entity of component.query(world, [components.VELOCITY, components.DRAG])) {
		const velocity = component.get<components.Velocity>(world, entity, components.VELOCITY);
		const { coefficient } = component.get<components.Drag>(world, entity, components.DRAG);
		const factor = Math.exp(-coefficient * dt);

		velocity.x *= factor;
		velocity.y *= factor;
	}
}
