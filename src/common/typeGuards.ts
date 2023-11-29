export function isDefined<T>(t: T | undefined): t is T {
  return t !== undefined;
}

export function isPresent<T>(t: T | null | undefined): t is T {
  return t !== null && t !== undefined;
}
