export const getUser = state => state.user;
export const hasPremium = state => {
  if (process.env.REACT_APP_FORCE_PREMIUM === 'true') {
    // Development environments force premium since they can't always implement the OAuth + for development pleasure.
    return true;
  }
  const user = getUser(state);
  return user ? user.premium : false;
};
