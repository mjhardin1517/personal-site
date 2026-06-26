import type { World } from '$lib/ecs';
import * as component from '$lib/ecs/component';
import * as components from '../components';

export function transform(world: World, dt: number) {
	const query = component.query(world, [
		components.TRANSFORM,
		components.VELOCITY,
		components.ANGULAR_VELOCITY,
		components.PREVIOUS_TRANSFORM,
	]);
	for (const entity of query) {
		const transform = component.get<components.Transform>(world, entity, components.TRANSFORM);
		const velocity = component.get<components.Velocity>(world, entity, components.VELOCITY);
		const angularVelocity = component.get<components.AngularVelocity>(
			world,
			entity,
			components.ANGULAR_VELOCITY,
		);
		const previous = component.get<components.PreviousTransform>(
			world,
			entity,
			components.PREVIOUS_TRANSFORM,
		);

		// Snapshot the state *before* integrating so the renderer can interpolate from it to the new
		// state by `alpha`. Captured every step, so it always holds the immediately prior step.
		previous.x = transform.x;
		previous.y = transform.y;
		previous.angle = transform.angle;

		transform.x += velocity.x * dt;
		transform.y += velocity.y * dt;
		transform.angle += angularVelocity.value * dt;
	}
}
