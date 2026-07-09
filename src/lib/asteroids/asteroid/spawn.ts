import type { World } from '$lib/ecs';
import type { Vec2 } from '$lib/math';
import * as entity from '$lib/ecs/entity';
import * as component from '$lib/ecs/component';
import * as polygon from '$lib/math/polygon';
import * as components from '../components';
import { createGraphic } from './polygon';

// TODO(collision step 5): drive this from a size tier (large/medium/small) — each tier picks its own
// radius/vertex range here and its own speed at the call site — and store the tier on the entity. That
// tier component doubles as the asteroid's identity for its reaction system (step 8).
const GRAPHIC_CONF = {
	jaggedness: 0.4,
	symmetry: 0.4,
	radius: { min: 50, max: 60 },
	vertices: { min: 10, max: 12 },
};

/** Bullets hit the rock's full circle - destroying a rock should feel generous. */
const HURTBOX_SCALE = 1;
/** The rock's ramming circle is pulled inside its spikes, so a graze doesn't kill the player. */
const HITBOX_SCALE = 0.6;

export type SpawnConf = {
	position: Vec2;
	velocity: Vec2;
	angularVelocity: number;
};

/**
 * Spawns a drifting asteroid: a generated jagged outline carrying the same transform/velocity/wrap/circle
 * components as everything else, so the shared systems move, wrap, and draw it for free. Extracted from
 * game.ts so tiers, collision boxes, and splitting all have one place to hook into.
 */
export function spawn(world: World, conf: SpawnConf): void {
	const rock = entity.create(world);
	const graphic = createGraphic(GRAPHIC_CONF);
	const radius = polygon.calcLargestRadius(graphic, { x: 0, y: 0 });

	component.put<components.Transform>(world, rock, components.TRANSFORM, {
		x: conf.position.x,
		y: conf.position.y,
		angle: 0,
	});
	component.put<components.Velocity>(world, rock, components.VELOCITY, {
		x: conf.velocity.x,
		y: conf.velocity.y,
	});
	component.put<components.AngularVelocity>(world, rock, components.ANGULAR_VELOCITY, {
		value: conf.angularVelocity,
	});
	component.put<components.VectorGraphic>(world, rock, components.VECTOR_GRAPHIC, {
		polygon: graphic,
	});
	component.put<components.Wrap>(world, rock, components.WRAP, { isWrapping: false, ghosts: [] });
	component.put<components.Circle>(world, rock, components.CIRCLE, { radius });
	component.put<components.PreviousTransform>(world, rock, components.PREVIOUS_TRANSFORM, {
		x: conf.position.x,
		y: conf.position.y,
		angle: 0,
	});

	// A rock both takes hits (big Hurtbox - generous target for shots) and deals them to the ship (small
	// Hitbox - fair on contact). Both derive from the visual radius above.
	component.put<components.Hurtbox>(world, rock, components.HURTBOX, {
		radius: radius * HURTBOX_SCALE,
		layer: 'asteroid',
	});
	component.put<components.Hitbox>(world, rock, components.HITBOX, {
		radius: radius * HITBOX_SCALE,
		targets: ['ship'],
	});
}
