// Some Typescript voodoo
// https://stackoverflow.com/questions/59765469/typescript-merge-n-objects-preserving-types
// https://stackoverflow.com/a/50375286/2398020
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

const merge = <T extends Array<Record<string, unknown>>>(
  ...objects: T
): UnionToIntersection<T[number]> => {
  if (import.meta.env.DEV) {
    const obj: Record<string, unknown> = {};
    objects.forEach((arg) => {
      (Object.keys(arg) as Array<keyof typeof arg>).forEach((key) => {
        if (obj[key]) {
          throw new Error('This key already exists:' + key);
        }
        obj[key] = arg[key];
      });
    });

    return obj as UnionToIntersection<T[number]>;
  }
  return Object.assign({}, ...objects);
};

export default merge;
