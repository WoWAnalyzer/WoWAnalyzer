import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from 'common/Wrapper';

import CORE_CHANGELOG from '../CHANGELOG';

const SECONDS_IN_DAY = 86400;
const DAYS_CONSIDERED_RECENT = 7;

class ChangelogTabTitle extends React.PureComponent {
  static contextTypes = {
    config: PropTypes.shape({
      changelog: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
    }).isRequired,
  };

  render() {
    let changelog = this.context.config.changelog;
    let recentChanges = 0;
    if (changelog instanceof Array) {
      // The changelog includes entries from the spec and core, so the count should too
      changelog = [
        ...CORE_CHANGELOG,
        ...changelog,
      ];

      // TODO: Instead of showing the amount in recent times, show the amount of new changes since last view
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
  }
}

export default ChangelogTabTitle;
