import TABS from 'interface/report/Results/TABS';

import getMatch from './getMatch';

export default state => {
  const match = getMatch(state);
  if (match && match.params.resultTab) {
    return match.params.resultTab;
  }
  return TABS.OVERVIEW;
};
