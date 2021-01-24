import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeNewsUrl(title) {
  return `/news/${prettyEncodeURI(title)}`;
}
