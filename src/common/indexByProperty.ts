// A helper function that's more performant than a reduce without being more readable by consumers
export default function indexByProperty<
  Key extends string,
  T extends { [k in Key]: string | number },
>(arr: T[], key: Key): Record<string | number, T> {
  const objByKey: Record<string | number, T> = {};
  const length = arr.length;
  for (let i = 0; i < length; i += 1) {
    const item = arr[i];
    objByKey[item[key]] = item;
  }
  return objByKey;
}
