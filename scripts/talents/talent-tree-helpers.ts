import fs from 'fs';

const debug = true;
/**
 * Requires NodeJS 18+ (or 17 with experimental flag)
 */
export async function readJsonFromUrl<T>(url: string): Promise<T> {
  const res = await fetch(url)
    .then((res) => res.json())
    .catch((err) => {
      throw err;
    });
  return res;
}

export function csvToObject<T>(csvString: string): T[] {
  const lines = csvString.split('\n');

  const result: T[] = [];

  const headers = lines[0].split(',');

  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < lines.length - 1; i++) {
    const obj: any = {};
    const currentline = lines[i].split(',');

    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = obj[headers[j]] || {};
      obj[headers[j]] = currentline[j];
    }

    result.push(obj as T);
  }

  debug &&
    fs.writeFileSync(
      `.${__dirname.replace(process.cwd(), '')}/generated.json`,
      JSON.stringify(result),
    );
  //JSON
  return result;
}

export async function readCsvFromUrl(url: string) {
  const res = await fetch(url, {
    method: 'get',
    headers: {
      'content-type': 'test/csv;charset=UTF-8',
    },
  })
    .then((res) => {
      return res.text();
    })
    .catch((err) => {
      throw err;
    });
  return res;
}
