export const getCharactersById = state => state.charactersById;
export const getCharacterById = (state, id) => getCharactersById(state)[id];
