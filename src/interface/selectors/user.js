export const getUser = state => state.user;
export const hasPremium = state => {
  if (process.env.REACT_APP_FORCE_PREMIUM === 'true') {
    // Development environments force premium since they can't always implement the OAuth + for development pleasure.
    return true;
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
