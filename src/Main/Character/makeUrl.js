import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeUrl(region, realm, player) {
  return `/character/${prettyEncodeURI(region)}/${prettyEncodeURI(realm)}/${prettyEncodeURI(player)}/`;
}
