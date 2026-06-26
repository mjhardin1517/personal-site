export type SparseSet<T> = {
	dense: number[];
	sparse: number[];
	values: T[];
};

export function create<T>(): SparseSet<T> {
	return {
		dense: [],
		sparse: [],
		values: [],
	};
}

export function has<T>(set: SparseSet<T>, key: number): boolean {
	const i = set.sparse[key];

	return i !== undefined && i < set.dense.length && set.dense[set.sparse[key]] === key;
}

export function put<T>(set: SparseSet<T>, key: number, value: T): void {
	if (has(set, key)) {
		const i = set.sparse[key];
		set.dense[i] = key;
		set.values[i] = value;
	} else {
		const i = set.dense.length;
		set.sparse[key] = i;
		set.dense.push(key);
		set.values.push(value);
	}
}

export function get<T>(set: SparseSet<T>, key: number): T | undefined {
	return set.values[set.sparse[key]];
}

export type Identify<T> = (item: T) => number;

export function remove<T>(set: SparseSet<T>, key: number): void {
	if (!has(set, key)) return;

	const denseIndexDelete = set.sparse[key];
	const isTail = denseIndexDelete === set.dense.length - 1;
	const lastKey = set.dense.pop();
	const last = set.values.pop();

	if (last !== undefined && lastKey !== undefined && !isTail) {
		set.dense[denseIndexDelete] = lastKey;
		set.sparse[lastKey] = denseIndexDelete;
		set.values[denseIndexDelete] = last;
	}
	delete set.sparse[key];
}
