import retryingRequest from './retryingRequest';

const availableRegions = {
  'eu': 'ru_RU',
  'us': 'en_US',
  'tw': 'zh_TW',
  'kr': 'ko_KR',
};

const USER_AGENT = process.env.USER_AGENT;

const get = url => retryingRequest({
  url,
  headers: {
    'User-Agent': USER_AGENT,
  },
  gzip: true,
  // we'll be making several requests, so pool connections
  forever: true,
  timeout: 4000, // ms after which to abort the request, when a character is uncached it's not uncommon to take ~2sec
  shouldRetry: error => {
    const { statusCode, response } = error;
    const body = response ? response.body : null;
    const isCharacterNotFoundError = statusCode === 404 && body && body.includes('Character not found.');
    // Previously `shouldRetry` checked for just `err instanceof RequestError || statusCode === 503` - but the Blizzard API is so buggy with random errors, we're better off just retrying by default
    // 503 errors happen regularly which probably means the character wasn't cached, try again once
    // it sometimes throws 404 errors (without the "Character not found." body) randomly for no reason
    const shouldRetry = !isCharacterNotFoundError;
    return shouldRetry;
  },
});
const makeBaseUrl = region => `https://${region}.api.battle.net/wow`;

export async function fetchCharacter(region, realm, name, fields = '') {
  region = region.toLowerCase();
  if (!availableRegions[region]) {
    throw new Error('Region not recognized.');
  }

  const url = `${makeBaseUrl(region)}/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}?locale=${availableRegions[region]}&fields=${fields}&apikey=${process.env.BATTLE_NET_API_KEY}`;
  return get(url);
}
