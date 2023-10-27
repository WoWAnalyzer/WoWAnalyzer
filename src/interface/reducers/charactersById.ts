import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeCharacterApiUrl } from 'common/makeApiUrl';
import { isSupportedRegion } from 'common/regions';
import CharacterProfile from 'parser/core/CharacterProfile';

interface FetchCharacterArgs {
  guid: number;
  name: string;
  server: string;
  region: string;
  classic?: boolean;
}
export const fetchCharacter = createAsyncThunk<CharacterProfile | null, FetchCharacterArgs>(
  'charactersById/fetchCharacter',
  async (arg) => {
    if (!isSupportedRegion(arg.region)) {
      throw new Error('Region not supported');
    }
    const response = await fetch(
      makeCharacterApiUrl(arg.guid, arg.region, arg.server, arg.name, arg.classic),
    );
    if (response.status === 404) {
      console.warn(`Character info not found: ${arg.name}`);
      return null;
    }
    if (response.status !== 200) {
      throw new Error(`Received unexpected response code: ${response.status}`);
    }
    const data = await response.json();
    return { guid: arg.guid, ...data } satisfies CharacterProfile;
  },
);

type CharactersByIdState = Record<number, CharacterProfile>;

const initialState: CharactersByIdState = {};

const charactersByIdSlice = createSlice({
  name: 'charactersById',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCharacter.fulfilled, (state, action) => {
      const payload = action.payload;
      if (payload) {
        state[payload.id] = payload;
      }
    });
  },
});

export default charactersByIdSlice.reducer;
