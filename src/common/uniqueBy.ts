export const uniqueBy = <T, U>(arr: T[], selector: (item: T) => U): T[] => {
  return arr.filter(
    (toCheck, currentIdx) =>
      arr.findIndex((possiblyFirst) => selector(possiblyFirst) === selector(toCheck)) ===
      currentIdx,
  );
};
