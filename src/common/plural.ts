export const plural = (num: number, plurals: { one: string; other: string }) => {
  if (num === 1) {
    return plurals.one;
  }
  return plurals.other;
};
