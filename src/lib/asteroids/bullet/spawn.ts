import type { World } from '$lib/ecs';
import type { Vec2 } from '$lib/math';
import * as entity from '$lib/ecs/entity';
import * as component from '$lib/ecs/component';
import * as polygon from '$lib/math/polygon';
import * as components from '../components';
import { createGraphic } from './polygon';

/**
 * Muzzle speed added to the ship's velocity, along its heading, px/s (classic Asteroids momentum).
 * In the original, a shot fired at rest moves at the ship's max, speed ~ 17 ship-lengths/s.
 */
const SPEED = 600;
/** How far ahead of the ship's center the shot appears, px (trying to get ~ the nose). */
const MUZZLE_OFFSET = 18;
/** Seconds before an un-hit shot fizzles out. In "Deluxe" - a bit under a full screen crossing (~2s). */
const LIFESPAN = 1.5;

/**
 * Spawns a bullet travelling along `from.angle`, inheriting the shooter's velocity (classic
 * Asteroids feel). It will auto destruct according to its lifespan.
 */
export function spawn(world: World, from: components.Transform, inherit: Vec2): void {
	const dirX = Math.cos(from.angle);
	const dirY = Math.sin(from.angle);
	const x = from.x + dirX * MUZZLE_OFFSET;
	const y = from.y + dirY * MUZZLE_OFFSET;

	const bullet = entity.create(world);
	const graphic = createGraphic();
	const radius = polygon.calcLargestRadius(graphic, { x: 0, y: 0 });

	component.put<components.Transform>(world, bullet, components.TRANSFORM, {
		x,
		y,
		angle: from.angle,
	});
	component.put<components.Velocity>(world, bullet, components.VELOCITY, {
		x: inherit.x + dirX * SPEED,
		y: inherit.y + dirY * SPEED,
	});
	component.put<components.AngularVelocity>(world, bullet, components.ANGULAR_VELOCITY, {
		value: 0,
	});
	component.put<components.VectorGraphic>(world, bullet, components.VECTOR_GRAPHIC, {
		polygon: graphic,
	});
	component.put<components.Wrap>(world, bullet, components.WRAP, { isWrapping: false, ghosts: [] });
	component.put<components.Circle>(world, bullet, components.CIRCLE, { radius });
	component.put<components.PreviousTransform>(world, bullet, components.PREVIOUS_TRANSFORM, {
		x,
		y,
		angle: from.angle,
	});
	component.put<components.Lifetime>(world, bullet, components.LIFETIME, { remaining: LIFESPAN });

	// A bullet is an aggressor only - its whole tiny body is the strike circle, aimed at rocks. It has no
	// Hurtbox; once spent it is stamped Collided on impact and the reaper (step 7) removes it.
	component.put<components.Hitbox>(world, bullet, components.HITBOX, {
		radius,
		targets: ['asteroid'],
	});
}
