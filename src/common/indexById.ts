interface BaseIndexableObj {
  id: number;
  __ignoreDuplication?: boolean;
}

const typedKeys = <T>(obj: T) => Object.keys(obj) as Array<keyof typeof obj>;

type RestrictedTable<T, E> = {
  [Key in keyof E]: T;
};

const indexById = <ValueT extends BaseIndexableObj, Map extends RestrictedTable<ValueT, any>>(
  arg: Map,
): RestrictedTable<ValueT, Map> & Record<number, ValueT> => {
  const indexedByNameAndId: RestrictedTable<ValueT, Map> & Record<number, ValueT> = { ...arg };
  typedKeys(arg).forEach((key) => {
    const value = arg[key];

    if (process.env.NODE_ENV === 'development') {
      if (
        indexedByNameAndId[value.id] &&
        !indexedByNameAndId[value.id].__ignoreDuplication &&
        !value.__ignoreDuplication
      ) {
        throw new Error(`A spell with this ID already exists: ${value.id}, ${String(key)}`);
      }
    }
    indexedByNameAndId[value.id] = value;
  });
  return indexedByNameAndId;
};

/**
 * Assert that `value` is a `RestrictedTable<T, E>` where `T` is fixed and `E` is inferred.
 */
export const asRestrictedTable = <T extends BaseIndexableObj>() => <E>(
  value: RestrictedTable<T, E>,
): RestrictedTable<T, E> => value;

export default indexById;
