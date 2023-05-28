import prettyEncodeURI from 'common/prettyEncodeURI';

export default function makeContributorUrl(title: string) {
  return `/contributor/${prettyEncodeURI(title)}`;
}
