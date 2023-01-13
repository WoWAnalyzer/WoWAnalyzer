import { RootState } from 'store';

export const getCharacterById = (state: RootState, id: number) => state.charactersById[id];
