import { shallowEqual } from 'react-redux';

interface BaseIndexableObj {
  id: number;
  __ignoreDuplication?: boolean;
}

const typedKeys = <T>(obj: T) => Object.keys(obj) as Array<keyof typeof obj>;

type RestrictedTable<T, E> = {
  [Key in keyof E]: E[Key] extends T ? E[Key] : never;
};

type IndexedRestrictedTable<
  ValueT extends BaseIndexableObj,
  Map extends RestrictedTable<ValueT, any>
> = RestrictedTable<ValueT, Map> & Record<number, ValueT>;

const indexById = <ValueT extends BaseIndexableObj, Map extends RestrictedTable<ValueT, any>>(
  arg: Map,
): IndexedRestrictedTable<ValueT, Map> => {
  const indexedByNameAndId: IndexedRestrictedTable<ValueT, Map> = { ...arg };
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

export const indexOnlyById = <
  ValueT extends BaseIndexableObj,
  Map extends RestrictedTable<ValueT, any>
>(
  arg: Map,
): Record<number, ValueT> => {
  const indexedByNameAndId: Record<number, ValueT> = {};
  typedKeys(arg).forEach((key) => {
    const value = arg[key];

    if (process.env.NODE_ENV === 'development') {
      // check if there's already an existing value by the same ID
      // and throw an error if it's not exactly equal
      // the shallow equality check is added to support cases like Warrior's Sudden Death talent
      if (
        indexedByNameAndId[value.id] &&
        !indexedByNameAndId[value.id].__ignoreDuplication &&
        !value.__ignoreDuplication &&
        !shallowEqual(indexedByNameAndId[value.id], value)
      ) {
        throw new Error(`A spell with this ID already exists: ${value.id}, ${String(key)}`);
      }
    }
    indexedByNameAndId[value.id] = value;
  });
  return indexedByNameAndId;
};

export const proxyRestrictedTable = <
  ValueT extends BaseIndexableObj,
  Map extends RestrictedTable<ValueT, any>
>(
  restrictedTable: IndexedRestrictedTable<ValueT, Map>,
  valueBeingAccessed: string,
  alternative: string,
): IndexedRestrictedTable<ValueT, Map> => {
  return new Proxy<IndexedRestrictedTable<ValueT, Map>>(restrictedTable, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (value === undefined) {
        if (process.env.NODE_ENV === 'production') {
          console.error(
            `Attempted to retrieve invalid or missing spell from ${valueBeingAccessed}. If this is expected, use ${alternative}.`,
            prop,
            target,
          );
        } else {
          throw new Error(
            `Attempted to retrieve invalid or missing spell from ${valueBeingAccessed}: ${String(
              prop,
            )}. If this is expected, use ${alternative}.`,
          );
        }
      }

      return value;
    },
  });
};

export default indexById;
