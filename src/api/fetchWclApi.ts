import { WCLResponseJSON } from 'api/WCL_TYPES';
import { captureException } from 'common/errorLogger';
import {
  ApiDownError,
  CharacterNotFoundError,
  GuildNotFoundError,
  JsonParseError,
  LogNotFoundError,
  UnknownApiError,
  WclApiError,
} from 'common/fetchWclApi';

const HTTP_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CLOUDFLARE: {
    UNKNOWN_ERROR: 520,
    WEB_SERVER_IS_DOWN: 521,
    CONNECTION_TIMED_OUT: 522,
    ORIGIN_IS_UNREACHABLE: 523,
    A_TIMEOUT_OCCURED: 524,
  },
};
const WCL_API_ERROR_TEXT = 'Warcraft Logs API error';

function fixControlCharacters(text: string) {
  // Try to replace non-ascii chars on "unexpected character"-errors
  // hotfixes the german logs that have control-characters in their names
  return text.replace(/[^\x20-\x7E]/g, '');
}

function fixSpellNameEscaping(text: string) {
  // WCL fails to escape spell names when using translate=true, leading to invalid JSON.
  // this fixes these logs by removing those
  const regex = /"name": ?"(.+?)",/g;
  // eslint-disable-next-line
  while (true) {
    const match = regex.exec(text);
    if (match === null) {
      break;
    }
    const spellName = match[1];
    if (spellName.includes('"')) {
      text = text.replace(spellName, spellName.replace(/\\"/g, '"').replace(/"/g, '\\"'));
    }
  }
  return text;
}

export async function toJson(response: string | Response) {
  // Manually parse the response JSON so we keep the original data in memory so we can pass it to Sentry if something is wrong.
  let text = typeof response === 'string' ? response : await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      try {
        text = fixControlCharacters(text);
        text = fixSpellNameEscaping(text);
        return JSON.parse(text);
      } catch (asciiFixError) {
        // Ignore the error since we're more interested in the original error.
      }
    }
    captureException(error, { extra: { text } });
    throw new JsonParseError();
  }
}

async function rawFetchWcl(url: string) {
  if (process.env.NODE_ENV === 'test') {
    throw new Error('Unable to query WCL during test');
  }

  const response = await fetch(url);

  if (Object.values(HTTP_CODES.CLOUDFLARE).includes(response.status)) {
    throw new ApiDownError(
      'The API is currently down. This is usually for maintenance which should only take about 10 seconds. Please try again in a moment.',
    );
  }
  const json = await toJson(response);

  if ([HTTP_CODES.BAD_REQUEST, HTTP_CODES.UNAUTHORIZED].includes(response.status)) {
    const message = json.message;
    if (message === 'This report does not exist or is private.') {
      throw new LogNotFoundError();
    }
    if (message === 'Invalid character name/server/region specified.') {
      throw new CharacterNotFoundError();
    }
    if (message === 'Invalid guild name/server/region specified.') {
      throw new GuildNotFoundError();
    }
    throw new Error(message || json.error);
  }
  if (!response.ok) {
    if (json.error === WCL_API_ERROR_TEXT) {
      throw new WclApiError(`${response.status}: ${json.message}`);
    } else {
      throw new UnknownApiError(`${response.status}: ${json.message}`);
    }
  }
  return json;
}

const fetchWcl = async <T extends WCLResponseJSON>(
  url: string,
  timeout: number = 10_000,
): Promise<T> => {
  let id: NodeJS.Timeout;

  const timeoutPromise = new Promise((resolve, reject) => {
    id = setTimeout(() => {
      reject('Request timed out, probably due to an issue on our side. Try again.');
    }, timeout);
  });

  return Promise.race<T>([
    rawFetchWcl(url).then((result) => {
      clearTimeout(id);
      return result;
    }),
    timeoutPromise,
  ]);
};

export default fetchWcl;
