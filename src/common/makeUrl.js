export default function makeUrl(base, queryParams = {}) {
  const keys = Object.keys(queryParams);

  const parts = [];
  keys.forEach((key) => {
    const value = queryParams[key];
    if (value === undefined) {
      return;
    }
    parts.push(`${key}=${encodeURIComponent(value)}`);
  });

  return `${base}?${parts.join('&')}`;
}
