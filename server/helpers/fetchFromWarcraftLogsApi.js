import querystring from 'querystring';
import request from 'request-promise-native';

import WarcraftLogsApiError from './WarcraftLogsApiError';

const WCL_DOMAIN = process.env.WARCRAFT_LOGS_DOMAIN;
const WCL_MAINTENANCE_STRING = 'Warcraft Logs is down for maintenance';
export const WCL_REPORT_DOES_NOT_EXIST_HTTP_CODE = 400;
const USER_AGENT = process.env.USER_AGENT;
const WCL_API_KEY = process.env.WCL_API_KEY;

function getWclApiUrl(path, query) {
  return `${WCL_DOMAIN}/v1/${path}?${querystring.stringify({
    api_key: WCL_API_KEY,
    ...query,
  })}`;
}
function tryJsonParse(string) {
  let json = null;
  try {
    json = JSON.parse(string);
  } catch (jsonErr) {
    // ignore
  }
  return json;
}
export default async function fetchFromWarcraftLogsApi(path, query) {
  const url = getWclApiUrl(path, query);
  try {
    const jsonString = await request.get({
      url,
      headers: {
        'User-Agent': USER_AGENT,
      },
      // using gzip is 80% quicker
      gzip: true,
      // we'll be making several requests, so pool connections
      forever: true,
    });

    // WCL maintenance mode returns 200 http code :(
    if (jsonString.includes(WCL_MAINTENANCE_STRING)) {
      throw new WarcraftLogsApiError(503, WCL_MAINTENANCE_STRING);
    }
    // WCL has a tendency to throw non-JSON errors with a 200 HTTP exception, this ensures they're not accepted and cached.
    // Decoding JSON takes a long time, grabbing the first character is near instant and has high accuracy.
    const firstCharacter = jsonString.substr(0, 1);
    if (firstCharacter !== '{' && firstCharacter !== '[') {
      throw new WarcraftLogsApiError(500, 'Corrupt Warcraft Logs API response received', jsonString);
    }

    return jsonString;
  } catch (err) {
    if (err instanceof WarcraftLogsApiError) {
      // Already the correct format, pass it along
      throw err;
    }
    if (err.error) {
      const json = tryJsonParse(err.error);
      if (json) {
        throw new WarcraftLogsApiError(err.statusCode, json.error);
      }
    }

    const message = err.error || err.message;
    throw new WarcraftLogsApiError(err.statusCode, message);
  }
}
