import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';
import { Link } from 'react-router-dom';

import getDifficulty from 'common/getDifficulty';
import getBossName from 'common/getBossName';
import ChecklistIcon from 'interface/icons/Checklist';
import StatisticsIcon from 'interface/icons/Statistics';
import TimelineIcon from 'interface/icons/Timeline';
import ArmorIcon from 'interface/icons/Armor';
import EventsIcon from 'interface/icons/Events';
import AboutIcon from 'interface/icons/About';

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

  get pages() {
    const { tabs } = this.props;

    return [
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
    // TODO: Reimplement?
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
  }

  renderBackground() {
    const { boss } = this.props;

    return (
      <div className="background">
        <div className="img" style={{ backgroundImage: `url(${boss.background})`, backgroundPosition: boss.backgroundPosition }} />
      </div>
    );
  }
  renderInfo() {
    const { config: { spec }, selectedCombatant, playerIcon, fight } = this.props;

    return (
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
              <h1 className="name">
                {selectedCombatant.name}
              </h1>
            </div>
          </div>
        </div>
      </div>
    );
  }
  renderNavigation() {
    const { makeTabUrl, selectedTab } = this.props;

    return (
      <nav>
        <div className="container">
          <ul>
            {this.pages.map(({ icon: Icon, name, url }) => (
              <li key={url} className={url === selectedTab ? 'active' : undefined}>
                <Link to={makeTabUrl(url)}>
                  <Icon />
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  render() {
    return (
      <header>
        {this.renderBackground()}
        {this.renderInfo()}
        {this.renderNavigation()}
      </header>
    );
  }
}

export default Headers;
