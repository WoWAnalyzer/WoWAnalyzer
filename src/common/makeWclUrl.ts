import makeQueryString from './makeQueryString';
import { QueryParams } from './QueryParams';

const WARCRAFT_LOGS_DOMAIN = 'https://www.warcraftlogs.com/';

export default function makeWclUrl(reportCode: string, queryParams: QueryParams = {}) {
  return `${WARCRAFT_LOGS_DOMAIN}reports/${reportCode}/#${makeQueryString(queryParams)}`;
}
