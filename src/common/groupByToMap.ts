export default function groupByToMap<T, Q>(
  arr: T[],
  predicate: (value: T, index: number, arr: T[]) => Q,
) {
  return arr.reduce((map, value, index, array) => {
    const key = predicate(value, index, array);
    const valueInMap = map.get(key)?.concat([value]) ?? [value];
    map.set(key, valueInMap);
    return map;
  }, new Map<Q, T[]>());
}
