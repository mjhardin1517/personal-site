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
