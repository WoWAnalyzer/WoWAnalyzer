import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeUrl(title) {
  return `/contributor/${prettyEncodeURI(title)}`;
}
