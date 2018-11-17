import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';
import { Link } from 'react-router-dom';

import getDifficulty from 'common/getDifficulty';
import getBossName from 'common/getBossName';
import SpecIcon from 'common/SpecIcon';
import ChecklistIcon from 'interface/icons/Checklist';
import SuggestionIcon from 'interface/icons/Suggestion';
import StatisticsIcon from 'interface/icons/Statistics';
import TimelineIcon from 'interface/icons/Timeline';
import ArmorIcon from 'interface/icons/Armor';

import SkullRaidMarker from './images/skull-raidmarker.png';

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
    makeTabUrl: PropTypes.func.isRequired,
    selectedTab: PropTypes.string.isRequired,
  };

  render() {
    const { config: { spec }, playerName, playerIcon, boss, fight, makeTabUrl, selectedTab } = this.props;

    const pages = [
      {
        icon: ChecklistIcon,
        name: <Trans>Checklist</Trans>,
        url: 'checklist',
      },
      {
        icon: SuggestionIcon,
        name: <Trans>Suggestions</Trans>,
        url: 'suggestions',
      },
      {
        icon: StatisticsIcon,
        name: <Trans>Statistics</Trans>,
        url: 'statistics',
      },
      {
        icon: TimelineIcon,
        name: <Trans>Timeline</Trans>,
        url: 'timeline',
      },
      {
        icon: TimelineIcon,
        name: <Trans>Abilities</Trans>,
        url: 'abilities',
      },
      {
        icon: TimelineIcon,
        name: <Trans>Focus Chart</Trans>,
        url: 'focus-chart',
      },
      {
        icon: TimelineIcon,
        name: <Trans>Cooldowns</Trans>,
        url: 'cooldowns',
      },
      {
        icon: TimelineIcon,
        name: <Trans>Events</Trans>,
        url: 'events',
      },
      {
        icon: ArmorIcon,
        name: <Trans>Character</Trans>,
        url: 'character',
      },
      {
        icon: TimelineIcon,
        name: <Trans>About</Trans>,
        url: 'about',
      },
    ];

    return (
      <header>
        <div className="background" style={{ backgroundImage: `url(${boss.background})` }} />
        <div className="container">
          <div className="boss">
            <div className="difficulty">
              {getDifficulty(fight)}
            </div>
            <div className="name">
              {getBossName(fight, false)}
            </div>
          </div>
          <div className="player">
            <div className="avatar">
              <img src={playerIcon} alt="" />
            </div>
            <div className={`name ${spec.className.replace(' ', '')}`}>
              {playerName}
            </div>
            <div className="title">
              Famed Slayer of G'huun
            </div>
            <div className="spec">
              {spec.specName} {spec.className}
            </div>
          </div>
        </div>

        <div className="flex tab-selection">
          <div>
            <ul>
              {pages.map(({ icon: Icon, name, url }) => {
                return (
                  <li key={url} className={url === selectedTab ? 'active' : undefined}>
                    <Link to={makeTabUrl(url)}>
                      <Icon />
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </header>
    );
  }
}

export default Headers;
