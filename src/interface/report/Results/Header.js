import React from 'react';
import PropTypes from 'prop-types';
import { t, Trans } from '@lingui/macro';
import { Link } from 'react-router-dom';

import getDifficulty from 'common/getDifficulty';
import getBossName from 'common/getBossName';
import SpecIcon from 'common/SpecIcon';
import ChecklistIcon from 'interface/icons/Checklist';
import SuggestionIcon from 'interface/icons/Suggestion';
import StatisticsIcon from 'interface/icons/Statistics';
import TimelineIcon from 'interface/icons/Timeline';
import ArmorIcon from 'interface/icons/Armor';
import EventsIcon from 'interface/icons/Events';
import AboutIcon from 'interface/icons/About';

import SkullRaidMarker from './images/skull-raidmarker.png';
import { i18n } from 'interface/RootLocalizationProvider';

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
    tabs: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.node.isRequired,
      url: PropTypes.string.isRequired,
      order: PropTypes.number,
    })).isRequired,
  };

  render() {
    const { config: { spec }, playerName, playerIcon, boss, fight, makeTabUrl, selectedTab, tabs } = this.props;

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
      ...tabs.sort((a, b) => a.order - b.order).map(tab => ({
        icon: tab.icon || TimelineIcon,
        name: tab.title,
        url: tab.url,
      })),
      {
        icon: EventsIcon,
        name: <Trans>Events</Trans>,
        url: 'events',
      },
      {
        icon: ArmorIcon,
        name: <Trans>Character</Trans>,
        url: 'character',
      },
      {
        icon: AboutIcon,
        name: <Trans>About</Trans>,
        url: 'about',
      },
    ];
    // if (process.env.NODE_ENV === 'development') {
    //   results.tabs.push({
    //     title: i18n._(t`Development`),
    //     url: 'development',
    //     order: 100000,
    //     render: () => (
    //       <DevelopmentTab
    //         parser={parser}
    //         results={results}
    //       />
    //     ),
    //   });
    // }

    return (
      <header>
        <div className="background" style={{ backgroundImage: `url(${boss.background})`, backgroundPosition: boss.backgroundPosition }} />
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
            <div className="details">
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
