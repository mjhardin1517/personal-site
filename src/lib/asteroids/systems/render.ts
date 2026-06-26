import type { World } from '$lib/ecs';
import * as resource from '$lib/ecs/resource';
import * as component from '$lib/ecs/component';
import * as resources from '../resources';
import * as components from '../components';
import type { Vec2, Polygon } from '$lib/math';

/**
 * Draws every renderable entity, interpolating between its previous and current fixed-step
 * transform by `alpha` (0..1) so motion is smooth regardless of the simulation rate.
 */
export function render(world: World, alpha: number) {
	const canvasCtx = resource.get<resources.CanvasCtx>(world, resources.CANVAS_CTX);
	const color = resource.get<resources.Color>(world, resources.COLOR);

	const query = component.query(world, [
		components.VECTOR_GRAPHIC,
		components.TRANSFORM,
		components.WRAP,
		components.PREVIOUS_TRANSFORM,
	]);
	for (const entity of query) {
		const vectorGraphic = component.get<components.VectorGraphic>(
			world,
			entity,
			components.VECTOR_GRAPHIC,
		);
		const transform = component.get<components.Transform>(world, entity, components.TRANSFORM);
		const wrap = component.get<components.Wrap>(world, entity, components.WRAP);
		const previous = component.get<components.PreviousTransform>(
			world,
			entity,
			components.PREVIOUS_TRANSFORM,
		);

		// Interpolated transform: where the entity should appear *between* the last two sim steps.
		const interpolated: Vec2 = {
			x: previous.x + (transform.x - previous.x) * alpha,
			y: previous.y + (transform.y - previous.y) * alpha,
		};
		const interpolatedAngle = previous.angle + (transform.angle - previous.angle) * alpha;

		drawGlowingPolygon(canvasCtx, vectorGraphic.polygon, interpolated, interpolatedAngle, color);

		// A ghost is just the body offset by one world-span (ghost - current position). Apply that
		// same offset to the interpolated body so the ghost tracks it exactly instead of leading it.
		for (const ghost of wrap.ghosts) {
			const ghostPosition: Vec2 = {
				x: interpolated.x + (ghost.x - transform.x),
				y: interpolated.y + (ghost.y - transform.y),
			};
			drawGlowingPolygon(canvasCtx, vectorGraphic.polygon, ghostPosition, interpolatedAngle, color);
		}
	}
}

function drawGlowingPolygon(
	ctx: CanvasRenderingContext2D,
	polygon: Polygon,
	position: Vec2,
	angle: number,
	color: string,
	close: boolean = true,
) {
	ctx.save();

	ctx.translate(position.x, position.y);
	ctx.rotate(angle);

	ctx.shadowBlur = 12;
	// ctx.shadowBlur = 0;
	ctx.shadowColor = color;
	ctx.strokeStyle = color;
	ctx.lineWidth = 1.4;
	ctx.lineJoin = 'round';

	ctx.beginPath();
	for (let i = 0; i < polygon.length; i++) {
		const vertex = polygon[i];
		if (i === 0) {
			ctx.moveTo(vertex.x, vertex.y);
		} else {
			ctx.lineTo(vertex.x, vertex.y);
		}
	}

	if (close) ctx.closePath();
	ctx.stroke();

	ctx.restore();
}
