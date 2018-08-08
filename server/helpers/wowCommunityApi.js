import request from 'request-promise-native';

const availableRegions = {
  'eu': 'ru_RU',
  'us': 'en_US',
  'tw': 'zh_TW',
  'kr': 'ko_KR',
};

const USER_AGENT = process.env.USER_AGENT;
const get = url => request.get({
  url,
  headers: {
    'User-Agent': USER_AGENT,
  },
  gzip: true,
  // we'll be making several requests, so pool connections
  forever: true,
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
