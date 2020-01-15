import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeUrl(region: string, realm: string, player: string) {
  return `/character/${prettyEncodeURI(region)}/${prettyEncodeURI(realm)}/${prettyEncodeURI(player)}/`;
}
