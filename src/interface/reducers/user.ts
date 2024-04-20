import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { captureException } from 'common/errorLogger';

type User = {
  name: string;
  avatar?: string;
  premium: boolean;
  github?: {
    premium?: boolean;
    expires?: string;
  };
};

export const fetchUser = createAsyncThunk<User | null>('user/fetchUser', async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SERVER_BASE}user`, {
      credentials: 'include',
    });

    if (response.status !== 200) {
      if (response.status === 401) {
        // Unauthorized
        // We need to store this explicitely so we know the diff between "unknown" and "logged out"
        return false;
      }
      throw new Error(response.statusText);
    }

    const data = await response.json();
    return data satisfies User;
  } catch (err: any) {
    captureException(err, {
      extra: {
        location: 'user',
      },
    });
    // fail silently since this only enhances the experience, if we're shortly down it shouldn't *kill* the experience.
  }
});

export const logout = createAsyncThunk('user/logout', async () => {
  try {
    await fetch(`${import.meta.env.VITE_SERVER_BASE}logout`, {
      credentials: 'include',
    });
  } catch (err: any) {
    captureException(err);
    console.error(err);
    // fail silently since this only enhances the experience, if we're shortly down it shouldn't *kill* the experience.
  }
  return;
});

type UserState = User | null;
const initialState: UserState = null as UserState;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      const payload = action.payload;
      if (payload) {
        return payload;
      } else {
        return state;
      }
    });
    builder.addCase(logout.fulfilled, () => {
      return null;
    });
  },
});

export const { reset } = userSlice.actions;
export default userSlice.reducer;
