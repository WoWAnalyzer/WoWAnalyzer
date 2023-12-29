import { RootState } from 'store';

export const getUser = (state: RootState) => state.user;
export const hasPremium = (state: RootState) => {
  if (import.meta.env.VITE_FORCE_PREMIUM === 'true') {
    // Development environments force premium since they can't always implement the OAuth + for development pleasure.
    return true;
  } else if (import.meta.env.VITE_FORCE_PREMIUM === 'false') {
    // Force disable it allows testing how things look without Premium.
    return false;
  }
  const user = getUser(state);
  if (user) {
    return user.premium;
  } else if (user === false) {
    // We have received the user status and it is: not logged in
    return false;
  } else {
    // We don't know yet, user status pending.
    return null;
  }
};
