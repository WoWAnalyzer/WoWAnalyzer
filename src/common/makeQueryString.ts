export interface QueryParams {
  [key: string]: string;
}

export default function makeQueryString(queryParams: QueryParams = {}): string {
  const entries = Object.entries(queryParams);

  const parts = entries
    .filter(entry => entry[1] !== undefined)
    .map(entry => `${entry[0]}=${encodeURIComponent(entry[1])}`);

  return parts.join('&');
}
