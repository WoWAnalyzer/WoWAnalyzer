import TABS from 'interface/report/Results/TABS';

import getMatch from './getMatch';

export default (pathname: string) => {
  const match = getMatch(pathname);
  if (match && match.params.resultTab) {
    return match.params.resultTab;
  }
  return TABS.OVERVIEW;
};
