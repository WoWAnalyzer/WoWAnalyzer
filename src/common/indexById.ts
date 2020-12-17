// For ease of use we may want to be able to both access items by code names for completion/compile time checking (e.g. `ABILITIES.AURA_OF_MERCY_TALENT`) and by spell id for runtime evaluation (e.g. `ABILITIES[183415]`)

const indexById = <T extends { [key: string]: any; id: number }>(list: { [key: string]: T; [key: number] : T }) => {
  for (const key in list) {
    const ability = list[key];

    if (process.env.NODE_ENV === 'development') {
      if (list[key].hasOwnProperty("id") && list[ability.id] && !list[ability.id].__ignoreDuplication && !ability.__ignoreDuplication) {
        throw new Error('A spell with this ID already exists: ' + ability.id + ',' + key);
      }
    }
    
    if (list[key].hasOwnProperty("id")) {
      list[list[key].id] = ability; 
    }
      
  }
  return list;
}

export default indexById;