import fs from 'fs';
import zlib from 'zlib';

const _CACHE = {};

export function loadLogSync(key, searchPath='test-logs/') {
  if(_CACHE[key] === undefined) {
    _CACHE[key] = JSON.parse(zlib.unzipSync(fs.readFileSync(`${searchPath}${key}.json.gz`)).toString());
  }
  return _CACHE[key];
}
