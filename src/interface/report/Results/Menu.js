import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';
import { Link } from 'react-router-dom';

import ChecklistIcon from 'interface/icons/Checklist';
import StatisticsIcon from 'interface/icons/Statistics';
import TimelineIcon from 'interface/icons/Timeline';
import ArmorIcon from 'interface/icons/Armor';
import EventsIcon from 'interface/icons/Events';
import AboutIcon from 'interface/icons/About';

class Menu extends React.PureComponent {
  static propTypes = {
    makeTabUrl: PropTypes.func.isRequired,
    selectedTab: PropTypes.string.isRequired,
    tabs: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.node.isRequired,
      url: PropTypes.string.isRequired,
      order: PropTypes.number,
    })).isRequired,
  };

  render() {
    const { makeTabUrl, selectedTab, tabs } = this.props;

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
      <menu>
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
      </menu>
    );
  }
}

export default Menu;
