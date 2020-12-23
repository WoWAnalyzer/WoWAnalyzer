import makeQueryString from 'common/makeQueryString';
import { QueryParams } from 'common/makeApiUrl';

const WARCRAFT_LOGS_DOMAIN = 'https://www.warcraftlogs.com/';

export default function makeWclUrl<T1>(reportCode: string, queryParams: QueryParams) {
  return `${WARCRAFT_LOGS_DOMAIN}reports/${reportCode}/#${makeQueryString(queryParams)}`;
}
