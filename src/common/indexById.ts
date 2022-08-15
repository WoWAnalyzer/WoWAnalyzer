interface BaseIndexableObj {
  id: number;
  __ignoreDuplication?: boolean;
}
// For ease of use we may want to be able to both access items by code names for completion/compile time checking (e.g. `ABILITIES.AURA_OF_MERCY_TALENT`) and by spell id for runtime evaluation (e.g. `ABILITIES[183415]`)
const indexById = <T extends BaseIndexableObj>(
  obj: Record<string, T>,
): Record<string | number, T> => {
  const count = Object.keys(obj).length;
  Object.keys(obj).forEach((key) => {
    const ability = obj[key];

    if (process.env.NODE_ENV === 'development') {
      const inverseAbility = obj[ability.id];
      if (inverseAbility && !inverseAbility.__ignoreDuplication && !ability.__ignoreDuplication) {
        throw new Error('A spell with this ID already exists: ' + ability.id + ',' + key);
      }
    }
    obj[ability.id] = ability;
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - couldn't get a combination of [key: string | number]: T + count: number on the return type
  // it will be assigned in runtime but anywhere it's needed, @ts-ignore it
  return Object.assign(obj, { count });
};

export default indexById;
