import retryingRequest from './retryingRequest';

const availableRegions = {
  'eu': 'ru_RU',
  'us': 'en_US',
  'tw': 'zh_TW',
  'kr': 'ko_KR',
};

const USER_AGENT = process.env.USER_AGENT;
const TIMEOUT = 4000; // ms after which to abort the request
const MAX_ATTEMPTS = 2;

const get = url => retryingRequest({
  url,
  headers: {
    'User-Agent': USER_AGENT,
  },
  gzip: true,
  // we'll be making several requests, so pool connections
  forever: true,
  timeout: TIMEOUT,
  maxAttempts: MAX_ATTEMPTS,
});
const makeBaseUrl = region => `https://${region}.api.battle.net/wow`;

export function fetchCharacter(region, realm, name, fields) {
  region = region.toLowerCase();
  if (!availableRegions[region]) {
    throw new Error('Region not recognized.');
  }

  const url = `${makeBaseUrl(region)}/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}?locale=${availableRegions[region]}&fields=${fields}&apikey=${process.env.BATTLE_NET_API_KEY}`;

  // 503 errors happen regularly which probably means the character wasn't cached, try again once
  return get(url)
    .catch(err => {
      if (err.statusCode === 503) {
        console.log('503, trying again once.');
        return get(url);
      }
      throw err;
    });
}
