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

	for (let i = 0; i < 1; i++) {
		const newEntity = entity.create(newWorld);
		component.put<components.Transform>(newWorld, newEntity, components.TRANSFORM, {
			x: -40,
			y: -40,
			angle: 0,
		});
		component.put(newWorld, newEntity, components.VELOCITY, { x: 55, y: 20 });
		component.put(newWorld, newEntity, components.ANGULAR_VELOCITY, { value: 0.5 });
		const asteroidPolygon = asteroid.createGraphic({
			jaggedness: 0.4,
			symmetry: 0.4,
			radius: { min: 50, max: 60 },
			vertices: { min: 10, max: 12 },
		});
		component.put<components.VectorGraphic>(newWorld, newEntity, components.VECTOR_GRAPHIC, {
			polygon: asteroidPolygon,
		});
		component.put<components.Wrap>(newWorld, newEntity, components.WRAP, {
			isWrapping: false,
			ghosts: [],
		});
		component.put<components.Circle>(newWorld, newEntity, components.CIRCLE, {
			radius: polygon.calcLargestRadius(asteroidPolygon, { x: 0, y: 0 }),
		});
		component.put<components.PreviousTransform>(
			newWorld,
			newEntity,
			components.PREVIOUS_TRANSFORM,
			{
				x: -40,
				y: -40,
				angle: 0,
			},
		);
	}

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
	component.put<components.Circle>(newWorld, shipEntity, components.CIRCLE, {
		radius: polygon.calcLargestRadius(shipPolygon, { x: 0, y: 0 }),
	});
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

	/* -------------------------------------------------------------------------------------------- */
	/* § Add render systems
  /* -------------------------------------------------------------------------------------------- */

	// Per-frame render schedule (receives the interpolation alpha, not dt).
	system.putRender(newWorld, systems.render);

	return newWorld;
}
