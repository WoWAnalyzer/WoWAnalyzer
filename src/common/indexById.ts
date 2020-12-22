// For ease of use we may want to be able to both access items by code names for completion/compile time checking (e.g. `ABILITIES.AURA_OF_MERCY_TALENT`) and by spell id for runtime evaluation (e.g. `ABILITIES[183415]`)

const indexById = <T extends {id: number, __ignoreDuplication?: boolean}> (list: Record<string, T>): Record<number, T> => {

  const ids: Record<number, T> = {};
  

  for (const key in list) {
    const ability = list[key];

    if (process.env.NODE_ENV === 'development') {
      if (Object.prototype.hasOwnProperty.call(list[key], "id") && list[ability.id] && !list[ability.id].__ignoreDuplication && !ability.__ignoreDuplication) {
        throw new Error('A spell with this ID already exists: ' + ability.id + ',' + key);
      }
    }
    
    if (Object.prototype.hasOwnProperty.call(list[key], "id")) {
      ids[ability.id] = ability; 
    }
      
  }
  return ids;
}

export default indexById;