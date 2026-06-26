import type { World } from '$lib/ecs';
import * as resource from '$lib/ecs/resource';
import * as component from '$lib/ecs/component';
import * as resources from '../resources';
import * as components from '../components';

/** Constant turn rate while a steer key is held (rad/s). No angular momentum — release = stop. */
const TURN_SPEED = 3.5;
/** Thrust acceleration along the nose while thrust is held (px/s²). Momentum carries; no drag yet. */
const THRUST_ACCEL = 260;

/**
 * Translates player input into ship intent. Steering sets a constant angular velocity and thrust
 * accelerates the velocity along the nose; the `transform` system then integrates both into the
 * angle and position. Must run *before* `transform` so the intent set here lands the same frame.
 */
export function playerControl(world: World, dt: number) {
	const input = resource.get<resources.Input>(world, resources.INPUT);

	const query = component.query(world, [
		components.PLAYER_CONTROLLED,
		components.TRANSFORM,
		components.ANGULAR_VELOCITY,
		components.VELOCITY,
	]);
	for (const entity of query) {
		const transform = component.get<components.Transform>(world, entity, components.TRANSFORM);
		const angularVelocity = component.get<components.AngularVelocity>(
			world,
			entity,
			components.ANGULAR_VELOCITY,
		);
		const velocity = component.get<components.Velocity>(world, entity, components.VELOCITY);

		// Steering: -1 (left), +1 (right), 0 (neither/both). Constant rate, integrated by transform.
		const turn = (input.right ? 1 : 0) - (input.left ? 1 : 0);
		angularVelocity.value = turn * TURN_SPEED;

		// Thrust: accelerate along the nose. The nose points +X at angle 0, so the heading unit
		// vector is (cos, sin). Velocity persists when released, giving the classic drift.
		if (input.thrust) {
			velocity.x += Math.cos(transform.angle) * THRUST_ACCEL * dt;
			velocity.y += Math.sin(transform.angle) * THRUST_ACCEL * dt;
		}

		// Discrete actions captured since the last step, consumed exactly once each.
		for (const action of input.queue) {
			switch (action) {
				case 'fire':
					// TODO: spawn a projectile from the ship's nose. Routed through the queue (rather
					// than a held flag) so one tap = one shot regardless of how many fixed steps ran.
					break;
			}
		}
	}

	// Drain the queue so events aren't re-consumed next step and it can't grow unbounded.
	input.queue.length = 0;
}
