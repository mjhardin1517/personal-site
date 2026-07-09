import type { Polygon, Vec2 } from '$lib/math';

export type Tag = Record<string, never>;

export type Transform = { x: number; y: number; angle: number };

export const TRANSFORM = 'transform';

export type PreviousTransform = { x: number; y: number; angle: number };

export const PREVIOUS_TRANSFORM = 'previous_transform';

export const WRAP = 'wrapping';

export type Wrap = {
	isWrapping: boolean;
	ghosts: Vec2[];
};

export type Velocity = Vec2;

export const VELOCITY = 'velocity';

export type AngularVelocity = { value: number };

export const ANGULAR_VELOCITY = 'angular_velocity';

export type Acceleration = Vec2;

export const ACCELERATION = 'acceleration';

export type VectorGraphic = { polygon: Polygon };

export const VECTOR_GRAPHIC = 'vector_graphic';

export type Circle = {
	radius: number;
};

export const CIRCLE = 'circle';

export type PlayerControlled = Tag;

export const PLAYER_CONTROLLED = 'player_controlled';

/** Seconds an entity has left before it self-destructs (e.g. a fired bullet with no target). */
export type Lifetime = { remaining: number };

export const LIFETIME = 'lifetime';

/** Hard cap on an entity's speed - the scalar magnitude of its velocity - in px/s. */
export type MaxSpeed = { value: number };

export const MAX_SPEED = 'max_speed';

/** Viscous drag coefficient (per second): velocity decays by `exp(-coefficient · dt)` each step. */
export type Drag = { coefficient: number };

export const DRAG = 'drag';
