import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeUrl(region: string, realm: string, guild: string, classic?: boolean) {
  if (classic) {
    return `/guild/${prettyEncodeURI(region)}/${prettyEncodeURI(realm)}/${prettyEncodeURI(
      guild,
    )}?game=classic`;
  }
  return `/guild/${prettyEncodeURI(region)}/${prettyEncodeURI(realm)}/${prettyEncodeURI(guild)}/`;
}
