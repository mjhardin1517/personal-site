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

/**
 * For determining what can actually be hit. These are collision categories, not identities.
 */
export type Layer = 'ship' | 'asteroid';

/**
 * A circle representing the bounds of where an entity can be hit by an aggressor entity, as well as
 * what layer it resides on.
 */
export type Hurtbox = { radius: number; layer: Layer };

export const HURTBOX = 'hurtbox';

/**
 * A circle representing the bounds of an entity capable of targeting and hitting another, as well as
 * what layers it can target.
 */
export type Hitbox = { radius: number; targets: Layer[] };

export const HITBOX = 'hitbox';

/**
 * Neutral "a collision happened this step" event, stamped on both participants by the collision system.
 */
export type Collided = Tag;

export const COLLIDED = 'collided';

// TODO(collision step 5): add an asteroid size/tier component (e.g. AsteroidSize = { tier: 'large' |
// 'medium' | 'small' }) so each rock carries its tier — splitting (step 8) reads it to pick the child tier.

/** Seconds an entity has left before it self-destructs (e.g. a fired bullet with no target). */
export type Lifetime = { remaining: number };

export const LIFETIME = 'lifetime';

/** Hard cap on an entity's speed - the scalar magnitude of its velocity - in px/s. */
export type MaxSpeed = { value: number };

export const MAX_SPEED = 'max_speed';

/** Viscous drag coefficient (per second): velocity decays by `exp(-coefficient · dt)` each step. */
export type Drag = { coefficient: number };

export const DRAG = 'drag';
