import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeUrl(region: string, realm: string, guild: string) {
  return `/guild/${prettyEncodeURI(region)}/${prettyEncodeURI(realm)}/${prettyEncodeURI(guild)}/`;
}
