import React from 'react';
import PropTypes from 'prop-types';
import Textfit from 'react-textfit';
import { Trans } from '@lingui/macro';

import getBossName from 'common/getBossName';
import SpecIcon from 'common/SpecIcon';

import SkullRaidMarker from './images/skull-raidmarker.png';
import ChecklistIcon from 'interface/icons/Checklist';
import SuggestionIcon from 'interface/icons/Suggestion';
import StatisticsIcon from 'interface/icons/Statistics';
import TimelineIcon from 'interface/icons/Timeline';
import ArmorIcon from 'interface/icons/Armor';

class Headers extends React.PureComponent {
  static propTypes = {
    config: PropTypes.shape({
      spec: PropTypes.shape({
        className: PropTypes.string.isRequired,
        specName: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    playerName: PropTypes.string.isRequired,
    playerIcon: PropTypes.string,
    boss: PropTypes.shape({
      headshot: PropTypes.string.isRequired,
    }),
    fight: PropTypes.object.isRequired,
  };

  render() {
    const { config: { spec }, playerName, playerIcon, boss, fight } = this.props;

    return (
      <header>
        <div className="background" style={{ backgroundImage: `url(${boss.background})` }} />
        <div className="boss">
          {getBossName(fight)}
        </div>

        <div className="flex tab-selection">
          <div>
            <ul>
              <li>
                <ChecklistIcon />
                <Trans>Checklist</Trans>
              </li>
              <li>
                <SuggestionIcon />
                <Trans>Suggestions</Trans>
              </li>
              <li>
                <StatisticsIcon />
                <Trans>Statistics</Trans>
              </li>
              <li>
                <TimelineIcon />
                <Trans>Timeline</Trans>
              </li>
              <li>
                Abilities
              </li>
              <li>
                Focus Chart
              </li>
              <li>
                Cooldowns
              </li>
              <li>
                Events
              </li>
              <li>
                <ArmorIcon /> <Trans>Character</Trans>
              </li>
              <li>
                About
              </li>
            </ul>
          </div>
        </div>
      </header>
    );
  }
}

export default Headers;
