import type { World } from '$lib/ecs';
import * as component from '$lib/ecs/component';
import * as components from '../components';
import * as asteroid from '../asteroid';

/** Each shattered rock spawns this many children of the next tier down. */
const CHILDREN = 2;
/** How far each child's heading fans off the parent's (radians, per side), so the pair separates. */
const SPREAD = Math.PI / 4;

/**
 * Asteroids' reaction to being Collided: shatter into the next tier down. Runs between collision and the
 * reaper, so it reads the doomed parent (position, velocity, tier) before the reaper removes it. Children
 * inherit the parent's heading but fan to opposite sides and take their tier's (faster) speed, so a split
 * visibly fans apart. The smallest tier has no child, so it is simply reaped with nothing spawned.
 *
 * Keys on the rock alone, not on what hit it, so shots and rams shatter rocks identically.
 */
export function asteroidSplit(world: World) {
	// Snapshot: we spawn new asteroids (which carry ASTEROID_SIZE) while iterating, and read parents pre-reap.
	const shattered = component.queryAll(world, [components.ASTEROID_SIZE, components.COLLIDED]);

	for (const rock of shattered) {
		const size = component.get<components.AsteroidSize>(world, rock, components.ASTEROID_SIZE);
		// Ignore null children
		const childTier = asteroid.TIERS[size.tier].child;
		if (childTier === null) continue;

		const transform = component.get<components.Transform>(world, rock, components.TRANSFORM);
		const velocity = component.get<components.Velocity>(world, rock, components.VELOCITY);

		// Inherit the parent's heading; fall back to a random one if it was ~stationary.
		const parentSpeed = Math.hypot(velocity.x, velocity.y);
		const baseHeading =
			parentSpeed > 1 ? Math.atan2(velocity.y, velocity.x) : Math.random() * Math.PI * 2;
		const speed = asteroid.TIERS[childTier].speed;

		for (let i = 0; i < CHILDREN; i++) {
			// Push children to opposite sides of the parent heading, each jittered within SPREAD.
			const side = i % 2 === 0 ? 1 : -1;
			const heading = baseHeading + side * SPREAD * (0.5 + Math.random() * 0.5);
			asteroid.spawn(world, {
				tier: childTier,
				position: { x: transform.x, y: transform.y },
				velocity: { x: Math.cos(heading) * speed, y: Math.sin(heading) * speed },
				angularVelocity: (Math.random() - 0.5) * 2,
			});
		}
	}
}
