import request from 'request-promise-native';

const availableRegions = [
  'eu',
  'us',
  'tw',
  'kr',
];

export function fetchCharacter(region, realm, name, fields) {
  region = region.toLowerCase();
  if (!availableRegions.includes(region)) {
    throw new Error('Region not recognized.');
  }

  return request.get({
    url: `https://${region}.api.battle.net/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}?locale=en_GB&apikey=${process.env.BATTLE_NET_API_KEY}&fields=${fields}`,
    headers: {
      'User-Agent': process.env.USER_AGENT,
    },
    gzip: true,
    forever: true, // we'll be making several requests, so pool connections
  });
}
