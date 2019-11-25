import makeQueryString from './makeQueryString';

const WARCRAFT_LOGS_DOMAIN = 'https://www.warcraftlogs.com/';

export default function makeWclUrl(reportCode, queryParams = {}) {
  return `${WARCRAFT_LOGS_DOMAIN}reports/${reportCode}/#${makeQueryString(queryParams)}`;
}
