import { QueryParams } from 'common/makeApiUrl';
import makeQueryString from 'common/makeQueryString';

const WARCRAFT_LOGS_DOMAIN = 'https://www.warcraftlogs.com/';

export default function makeWclUrl(reportCode: string, queryParams: QueryParams) {
  return `${WARCRAFT_LOGS_DOMAIN}reports/${reportCode}/#${makeQueryString(queryParams)}`;
}
