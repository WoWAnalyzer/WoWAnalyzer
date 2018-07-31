import request from 'request-promise-native';

const availableRegions = {
  'eu': 'ru_RU',
  'us': 'en_US',
  'tw': 'zh_TW',
  'kr': 'ko_KR',
};

export function fetchCharacter(region, realm, name, fields) {
  region = region.toLowerCase();
  if (!Object.keys(availableRegions).includes(region)) {
    throw new Error('Region not recognized.');
  }

  return request.get({
    url: `https://${region}.api.battle.net/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}?locale=${availableRegions[region]}&apikey=${process.env.BATTLE_NET_API_KEY}&fields=${fields}`,
    headers: {
      'User-Agent': process.env.USER_AGENT,
    },
    gzip: true,
    forever: true, // we'll be making several requests, so pool connections
  });
}
