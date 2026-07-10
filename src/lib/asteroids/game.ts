import * as world from '$lib/ecs/world';
import * as component from '$lib/ecs/component';
import * as resource from '$lib/ecs/resource';
import * as entity from '$lib/ecs/entity';
import * as system from '$lib/ecs/system';
import * as resources from './resources';
import * as components from './components';
import * as systems from './systems';
import * as polygon from '$lib/math/polygon';
import * as asteroid from './asteroid';
import * as ship from './ship';

import { phosphor } from '$lib/styles/tokens';

export type Conf = {
	canvasCtx: resources.CanvasCtx;
	worldSize: resources.WorldSize;
};

export function create(conf: Conf) {
	const newWorld = world.create();

	/* -------------------------------------------------------------------------------------------- */
	/* § Register components
  /* -------------------------------------------------------------------------------------------- */

	component.register(newWorld, components.TRANSFORM);
	component.register(newWorld, components.VELOCITY);
	component.register(newWorld, components.ANGULAR_VELOCITY);
	component.register(newWorld, components.VECTOR_GRAPHIC);
	component.register(newWorld, components.WRAP);
	component.register(newWorld, components.CIRCLE);
	component.register(newWorld, components.PLAYER_CONTROLLED);
	component.register(newWorld, components.PREVIOUS_TRANSFORM);
	component.register(newWorld, components.LIFETIME);
	component.register(newWorld, components.MAX_SPEED);
	component.register(newWorld, components.DRAG);
	component.register(newWorld, components.HITBOX);
	component.register(newWorld, components.HURTBOX);
	component.register(newWorld, components.COLLIDED);
	component.register(newWorld, components.ASTEROID_SIZE);

	/* -------------------------------------------------------------------------------------------- */
	/* § Add resources
  /* -------------------------------------------------------------------------------------------- */

	resource.put(newWorld, resources.CANVAS_CTX, conf.canvasCtx);
	resource.put(newWorld, resources.WORLD_SIZE, conf.worldSize);
	resource.put(newWorld, resources.COLOR, phosphor);
	resource.put(newWorld, resources.INPUT, resources.createInput());

	/* -------------------------------------------------------------------------------------------- */
	/* § Add initial entities
  /* -------------------------------------------------------------------------------------------- */

	// A single drifting rock for now — wave/level spawning comes later.
	asteroid.spawn(newWorld, {
		tier: 'large',
		position: { x: -40, y: -40 },
		velocity: { x: 55, y: 20 },
		angularVelocity: 0.5,
	});

	// Ship — set adrift like the asteroid for now (no thrust/steering yet).
	const shipEntity = entity.create(newWorld);
	component.put<components.Transform>(newWorld, shipEntity, components.TRANSFORM, {
		x: conf.worldSize.x / 2,
		y: conf.worldSize.y / 2,
		angle: 0,
	});
	component.put(newWorld, shipEntity, components.VELOCITY, { x: 0, y: 0 });
	component.put(newWorld, shipEntity, components.ANGULAR_VELOCITY, { value: 0 });
	const shipPolygon = ship.createGraphic(0.66);
	component.put<components.VectorGraphic>(newWorld, shipEntity, components.VECTOR_GRAPHIC, {
		polygon: shipPolygon,
	});
	component.put<components.Wrap>(newWorld, shipEntity, components.WRAP, {
		isWrapping: false,
		ghosts: [],
	});
	const shipRadius = polygon.calcLargestRadius(shipPolygon, { x: 0, y: 0 });
	component.put<components.Circle>(newWorld, shipEntity, components.CIRCLE, { radius: shipRadius });
	component.put<components.PlayerControlled>(
		newWorld,
		shipEntity,
		components.PLAYER_CONTROLLED,
		{},
	);
	component.put<components.PreviousTransform>(newWorld, shipEntity, components.PREVIOUS_TRANSFORM, {
		x: conf.worldSize.x / 2,
		y: conf.worldSize.y / 2,
		angle: 0,
	});
	// Asteroids Deluxe handling: top speed is a hard cap (~17 ship-lengths/s), and light drag bleeds
	// off drift. Ship-only — bullets and asteroids stay frictionless.
	component.put<components.MaxSpeed>(newWorld, shipEntity, components.MAX_SPEED, { value: 600 });
	component.put<components.Drag>(newWorld, shipEntity, components.DRAG, { coefficient: 0.5 });
	// The ship only ever takes hits (no ramming, no powerups), so it gets a Hurtbox and no Hitbox. The
	// radius sits well inside the hull - forgiving, so near-misses feel fair.
	component.put<components.Hurtbox>(newWorld, shipEntity, components.HURTBOX, {
		radius: shipRadius * 0.5,
		layer: 'ship',
	});
	// TODO(collision step 9): a ship-reaction system queries [PlayerControlled, Collided] and handles death
	// here; the reaper then removes it. Respawn, lives, and invulnerability are a separate feature.

	/* -------------------------------------------------------------------------------------------- */
	/* § Add fixed update systems
  /* -------------------------------------------------------------------------------------------- */

	system.put(newWorld, systems.playerControl);
	// Drag then the speed cap shape the ship's velocity before transform integrates it.
	system.put(newWorld, systems.drag);
	system.put(newWorld, systems.maxSpeed);
	system.put(newWorld, systems.transform);
	// Wrap is needs transform to happen to evaluate
	system.put(newWorld, systems.wrap);
	// Expire and destroy spent bullets.
	system.put(newWorld, systems.lifetime);
	// Detect Hitbox×Hurtbox overlaps by mask and stamp both parties with Collided (positions are final now).
	system.put(newWorld, systems.collision);
	// Reaction systems read Collided for side effects, BETWEEN collision and the reaper (so they run before
	// teardown). A shattered rock spawns the next tier down.
	system.put(newWorld, systems.asteroidSplit);
	// TODO(collision step 9): register the ship-death reaction here too, before the reaper.
	// The reaper runs LAST: it removes every entity stamped Collided this step.
	system.put(newWorld, systems.reaper);

	/* -------------------------------------------------------------------------------------------- */
	/* § Add render systems
  /* -------------------------------------------------------------------------------------------- */

	// Per-frame render schedule (receives the interpolation alpha, not dt).
	system.putRender(newWorld, systems.render);

	return newWorld;
}
