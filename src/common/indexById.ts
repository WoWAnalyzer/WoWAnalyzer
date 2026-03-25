import typedKeys from 'common/typedKeys';

interface BaseIndexableObj {
  id: number;
  __ignoreDuplication?: boolean;
}

type RestrictedTable<T, E> = {
  [Key in keyof E]: E[Key] extends T ? E[Key] : never;
};

type IndexedRestrictedTable<
  ValueT extends BaseIndexableObj,
  Map extends RestrictedTable<ValueT, any>, // oxlint-disable-line typescript-eslint/no-explicit-any -- Baseline suppression. Try to fix if you edit this code.
> = RestrictedTable<ValueT, Map> & Record<number, ValueT>;

// oxlint-disable-next-line typescript-eslint/no-explicit-any -- Baseline suppression. Try to fix if you edit this code.
const indexById = <ValueT extends BaseIndexableObj, Map extends RestrictedTable<ValueT, any>>(
  arg: Map,
): IndexedRestrictedTable<ValueT, Map> => {
  const indexedByNameAndId: IndexedRestrictedTable<ValueT, Map> = { ...arg };
  typedKeys(arg).forEach((key) => {
    const value = arg[key];

    if (import.meta.env.DEV) {
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

export const proxyRestrictedTable = <
  ValueT extends BaseIndexableObj,
  Map extends RestrictedTable<ValueT, any>, // oxlint-disable-line typescript-eslint/no-explicit-any -- Baseline suppression. Try to fix if you edit this code.
>(
  restrictedTable: IndexedRestrictedTable<ValueT, Map>,
  valueBeingAccessed: string,
  alternative: string,
): IndexedRestrictedTable<ValueT, Map> => {
  return new Proxy<IndexedRestrictedTable<ValueT, Map>>(restrictedTable, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (value === undefined) {
        if (import.meta.env.PROD) {
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
