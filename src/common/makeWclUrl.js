import makeQueryString from './makeQueryString';

export default function makeWclUrl(reportCode, queryParams = {}) {
  return `${process.env.REACT_APP_WARCRAFT_LOGS_DOMAIN}reports/${reportCode}/#${makeQueryString(queryParams)}`;
}
