import React from 'react';
import PropTypes from 'prop-types';
import { t, Trans } from '@lingui/macro';
import { Link } from 'react-router-dom';

import getDifficulty from 'common/getDifficulty';
import getBossName from 'common/getBossName';
import SpellIcon from 'common/SpellIcon';
import ChecklistIcon from 'interface/icons/Checklist';
import SuggestionIcon from 'interface/icons/Suggestion';
import StatisticsIcon from 'interface/icons/Statistics';
import TimelineIcon from 'interface/icons/Timeline';
import ArmorIcon from 'interface/icons/Armor';
import EventsIcon from 'interface/icons/Events';
import AboutIcon from 'interface/icons/About';
import StatTracker from 'parser/shared/modules/StatTracker';

import SkullRaidMarker from './images/skull-raidmarker.png';
import { i18n } from 'interface/RootLocalizationProvider';
import StatDisplay from './StatDisplay';

class Headers extends React.PureComponent {
  static propTypes = {
    config: PropTypes.shape({
      spec: PropTypes.shape({
        className: PropTypes.string.isRequired,
        specName: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    selectedCombatant: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
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
    const { config: { spec }, selectedCombatant, playerIcon, boss, fight, makeTabUrl, selectedTab, tabs } = this.props;

    const pages = [
      {
        icon: ChecklistIcon,
        name: <Trans>Overview</Trans>,
        url: 'overview',
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
        <div className="background">
          <div className="img" style={{ backgroundImage: `url(${boss.background})`, backgroundPosition: boss.backgroundPosition }} />
        </div>
        <div className="info">
          <div className="container">
            <div className="boss">
              <h2>
                {getDifficulty(fight)}
              </h2>
              <h1>
                {getBossName(fight, false)}
              </h1>
            </div>
            <div className="player">
              <div className="avatar">
                <img src={playerIcon} alt="" />
              </div>
              <div className="details">
                <h2>
                  {spec.specName} {spec.className}
                </h2>
                <h1 className={`name`}>
                  {selectedCombatant.name}
                </h1>
              </div>
            </div>
            {/*<div className="outfit">*/}
              {/*<h1>Outfit</h1>*/}
              {/*{selectedCombatant.talents.map(talent => (*/}
                {/*<SpellIcon*/}
                  {/*key={talent}*/}
                  {/*id={talent}*/}
                {/*/>*/}
              {/*))}*/}
            {/*</div>*/}
          </div>
        </div>

        <div className="tab-selection">
          <div className="container">
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
