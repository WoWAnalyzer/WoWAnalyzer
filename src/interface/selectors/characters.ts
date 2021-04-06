import { RootState } from 'interface/reducers';

export const getCharacterById = (state: RootState, id: number) => state.charactersById[id];
