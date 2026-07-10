import type { World } from '$lib/ecs';
import * as resource from '$lib/ecs/resource';
import * as component from '$lib/ecs/component';
import * as resources from '../resources';
import * as components from '../components';
import * as bullet from '../bullet';

/**
 * Constant turn rate while a steer key is held (rad/s). No angular momentum (release = stop).
 * Approximate the Deluxe's ±3 of 256 headings per frame at 60fps -> ~1.4s for a full rotation.
 */
const TURN_SPEED = 4.4;
/**
 * Thrust acceleration along the nose while thrust is held (px/s^2). Approximate Deluxe's ~1s to top
 * speed.
 */
const THRUST_ACCEL = 600;
/** Classic Asteroids caps shots on screen. */
const MAX_BULLETS = 4;

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
					if (component.count(world, components.BULLET) >= MAX_BULLETS) break;
					// One shot per tap (the queue already de-duped held-key repeat). The bullet
					// inherits the ship's heading and velocity; with no collision yet, its Lifetime
					// is what expires it.
					bullet.spawn(world, transform, velocity);
					break;
			}
		}
	}

	// Drain the queue so events aren't re-consumed next step and it can't grow unbounded.
	input.queue.length = 0;
}
