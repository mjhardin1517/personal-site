import type { SparseSet } from '$lib/sparse-set';

export type Entity = number;

export type System = (world: World, dt: number) => void;

export type World = {
	nextId: number;
	/** Recycled IDs from deleted entities */
	freeIds: number[];
	activeEntities: SparseSet<Entity>;
	componentStore: Record<string, SparseSet<unknown>>;
	resources: Record<string, unknown>;
	/** Run on the fixed simulation step; the number passed is `dt` (seconds per step). */
	updateSystems: System[];
	/** Run once per displayed frame; the number passed is the interpolation `alpha` (0..1). */
	renderSystems: System[];
};
