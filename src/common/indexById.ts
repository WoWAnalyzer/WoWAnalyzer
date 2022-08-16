interface BaseIndexableObj {
  id: number;
  __ignoreDuplication?: boolean;
}

const typedKeys = <T>(obj: T) => Object.keys(obj) as Array<keyof typeof obj>;

interface NameIndexed<T> {
  [name: string]: T;
}

// For ease of use we may want to be able to both access items by code names for completion/compile time checking (e.g. `ABILITIES.AURA_OF_MERCY_TALENT`) and by spell id for runtime evaluation (e.g. `ABILITIES[183415]`)
const indexById = <Idx extends BaseIndexableObj>() => <T extends NameIndexed<Idx>>(
  arg: T,
): {
  [key in keyof typeof arg | number]: Idx;
} => {
  const indexedByNameAndId: {
    [key in keyof typeof arg | number]: Idx;
  } = { ...arg };
  // const count = Object.keys(obj).length;
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

export const asIndexableList = <Idx extends BaseIndexableObj>() => <T extends NameIndexed<Idx>>(
  arg: T,
) => arg;

export default indexById;
