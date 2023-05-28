import { QueryParams } from 'common/makeApiUrl';
import makeQueryString from 'common/makeQueryString';
import Expansion, { CLASSIC_EXPANSION } from 'game/Expansion';

const WARCRAFT_LOGS_DOMAIN = 'https://www.warcraftlogs.com/';
const WARCRAFT_LOGS_CLASSIC_DOMAIN = 'https://classic.warcraftlogs.com/';

export default function makeWclUrl(
  reportCode: string,
  queryParams: QueryParams,
  expansion?: Expansion,
) {
  return `${
    expansion === CLASSIC_EXPANSION ? WARCRAFT_LOGS_CLASSIC_DOMAIN : WARCRAFT_LOGS_DOMAIN
  }reports/${reportCode}/#${makeQueryString(queryParams)}`;
}
