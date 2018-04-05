import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeUrl(region, realm, player) {
  return `/contributor/${prettyEncodeURI(region)}/${prettyEncodeURI(realm)}/${prettyEncodeURI(player)}/`;
}
