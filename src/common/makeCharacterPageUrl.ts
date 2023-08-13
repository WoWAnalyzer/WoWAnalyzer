import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeUrl(region: string, realm: string, player: string, classic?: boolean) {
  if (classic) {
    return `/character/${prettyEncodeURI(region)}/${prettyEncodeURI(realm)}/${prettyEncodeURI(
      player,
    )}?game=classic`;
  }
  return `/character/${prettyEncodeURI(region)}/${prettyEncodeURI(realm)}/${prettyEncodeURI(
    player,
  )}/`;
}
