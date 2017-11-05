import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from 'common/Wrapper';

const SECONDS_IN_DAY = 86400;
const DAYS_CONSIDERED_RECENT = 7;

const ChangelogTab = (_, { config }) => {
  const changelog = config.changelog;
  let recentChanges = 0;
  if (changelog instanceof Array) {
    recentChanges = changelog.reduce((total, entry) => {
      if (((+new Date() - entry.date) / 1000) < (SECONDS_IN_DAY * DAYS_CONSIDERED_RECENT)) {
        total += 1;
      }
      return total;
    }, 0);
  }

  return (
    <Wrapper>
      Changelog {recentChanges > 0 && <span className="badge">{recentChanges}</span>}
    </Wrapper>
  );
};
ChangelogTab.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default ChangelogTab;
