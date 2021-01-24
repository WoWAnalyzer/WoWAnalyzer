import { QueryParams } from 'common/makeApiUrl';

export default function makeQueryString(queryParams: QueryParams = {}) {
  const keys = Object.keys(queryParams);

  const parts: string[] = [];
  keys.forEach((key) => {
    const value = queryParams[key];
    if (value === undefined) {
      return;
    }
    parts.push(`${key}=${encodeURIComponent(value)}`);
  });

  return parts.join('&');
}
