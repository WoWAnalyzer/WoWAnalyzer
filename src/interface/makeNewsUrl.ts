import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeNewsUrl(title: string) {
  return `/news/${prettyEncodeURI(title)}`;
}
