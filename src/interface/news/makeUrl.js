import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeUrl(title) {
  return `/news/${prettyEncodeURI(title)}`;
}
