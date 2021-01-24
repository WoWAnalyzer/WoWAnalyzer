// For ease of use we may want to be able to both access items by code names for completion/compile time checking (e.g. `ABILITIES.AURA_OF_MERCY_TALENT`) and by spell id for runtime evaluation (e.g. `ABILITIES[183415]`)
const indexById = obj => {
  // Hackety hack
  obj.count = Object.keys(obj).length;
  Object.keys(obj).forEach((key) => {
    const ability = obj[key];

    if (process.env.NODE_ENV === 'development') {
      if (obj[ability.id] && !obj[ability.id].__ignoreDuplication && !ability.__ignoreDuplication) {
        throw new Error('A spell with this ID already exists: ' + ability.id + ',' + key);
      }
    }
    obj[ability.id] = ability;
  });
  return obj;
};

export default indexById;
