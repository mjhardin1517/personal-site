import type { World } from '$lib/ecs';
import * as resource from '$lib/ecs/resource';
import * as resources from './resources';

/**
 * Maps physical keys to the semantic Input. This is the DOM edge of the game — the only place that
 * knows about ArrowLeft/Right/Up/Space. Held keys set level flags; Space enqueues a discrete `fire`
 * event (once per press — OS key-repeat is filtered). Returns a teardown that removes the listeners
 * (call it from the component's onMount cleanup so HMR / navigation don't leak handlers).
 */
export function bindKeyboard(input: resources.Input): () => void {
	function onKeyDown(event: KeyboardEvent) {
		switch (event.code) {
			case 'ArrowLeft':
				input.left = true;
				break;
			case 'ArrowRight':
				input.right = true;
				break;
			case 'ArrowUp':
				input.thrust = true;
				break;
			case 'Space':
				// Discrete: one event per physical press. `event.repeat` is the OS auto-repeat that
				// fires while a key is held — ignore it so holding Space doesn't autofire here.
				if (!event.repeat) input.queue.push('fire');
				break;
			default:
				return; // Unhandled key — leave default browser behavior intact.
		}
		// Swallow the keys we handle so arrows don't scroll and Space doesn't page-down.
		event.preventDefault();
	}

	function onKeyUp(event: KeyboardEvent) {
		switch (event.code) {
			case 'ArrowLeft':
				input.left = false;
				break;
			case 'ArrowRight':
				input.right = false;
				break;
			case 'ArrowUp':
				input.thrust = false;
				break;
			default:
				return;
		}
		event.preventDefault();
	}

	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('keyup', onKeyUp);

	return () => {
		window.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('keyup', onKeyUp);
	};
}

/** Convenience: bind the keyboard to a world's Input resource. Returns a teardown. */
export function bindInput(world: World): () => void {
	return bindKeyboard(resource.get<resources.Input>(world, resources.INPUT));
}
