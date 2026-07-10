import type { World } from '$lib/ecs';
import type { Vec2 } from '$lib/math';
import * as entity from '$lib/ecs/entity';
import * as component from '$lib/ecs/component';
import * as polygon from '$lib/math/polygon';
import * as components from '../components';
import { createGraphic } from './polygon';

/** Tier presets. Null child indicates it will vanish next */
export const TIERS: Record<
	components.Tier,
	{ radius: { min: number; max: number }; speed: number; child: components.Tier | null }
> = {
	large: { radius: { min: 50, max: 60 }, speed: 45, child: 'medium' },
	medium: { radius: { min: 28, max: 34 }, speed: 75, child: 'small' },
	small: { radius: { min: 14, max: 18 }, speed: 155, child: null },
};

/** Outline shape knobs shared by every tier; each tier supplies its own radius range (see TIERS). */
const GRAPHIC_CONF = {
	jaggedness: 0.4,
	symmetry: 0.4,
	vertices: { min: 10, max: 12 },
};

/** Bullets hit the rock's full circle - destroying a rock should feel generous. */
const HURTBOX_SCALE = 0.95;
/** The rock's ramming circle is pulled inside its spikes, so a graze doesn't kill the player. */
const HITBOX_SCALE = 0.75;

export type SpawnConf = {
	tier: components.Tier;
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
	const graphic = createGraphic({ ...GRAPHIC_CONF, radius: TIERS[conf.tier].radius });
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
	component.put<components.Hurtbox>(world, rock, components.HURTBOX, {
		radius: radius * HURTBOX_SCALE,
		layer: 'asteroid',
	});
	component.put<components.Hitbox>(world, rock, components.HITBOX, {
		radius: radius * HITBOX_SCALE,
		targets: ['ship'],
	});
	component.put<components.AsteroidSize>(world, rock, components.ASTEROID_SIZE, {
		tier: conf.tier,
	});
}
