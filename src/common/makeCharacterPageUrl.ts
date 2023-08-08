import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeUrl(region: string, realm: string, player: string, classic?: boolean) {
  if (classic) {
    return `/character/classic/${prettyEncodeURI(region)}/${prettyEncodeURI(
      realm,
    )}/${prettyEncodeURI(player)}/`;
  }
  return `/character/${prettyEncodeURI(region)}/${prettyEncodeURI(realm)}/${prettyEncodeURI(
    player,
  )}/`;
}
