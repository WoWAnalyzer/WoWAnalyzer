import { getMatchWithReportCode } from './getMatch';

export default (pathname: string) => {
  const match = getMatchWithReportCode(pathname);
  return match ? match.params.reportCode : null;
};
