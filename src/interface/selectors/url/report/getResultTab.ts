import TABS from 'interface/report/Results/TABS';

import { getMatchWithResultTab } from './getMatch';

export default (pathname: string) => {
  const match = getMatchWithResultTab(pathname);
  if (match && match.params.resultTab) {
    return match.params.resultTab;
  }
  return TABS.OVERVIEW;
};
