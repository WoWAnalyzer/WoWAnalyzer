import { Link } from 'react-router-dom';
import React, { ComponentType, ReactNode } from 'react';
import { Trans } from '@lingui/macro';

import ChecklistIcon from 'interface/icons/Checklist';
import StatisticsIcon from 'interface/icons/Statistics';
import TimelineIcon from 'interface/icons/Timeline';
import OtherIcon from 'interface/icons/More';
import ArmorIcon from 'interface/icons/Armor';
import AboutIcon from 'interface/icons/About';
import EventsIcon from 'interface/icons/Events';

interface Props {
  makeTabUrl: (url: string) => string;
  tabs: Array<{
    title: ReactNode;
    icon?: ComponentType;
    url: string;
    order?: number;
  }>;
  selectedTab: string;
}

const NavigationBar = ({ makeTabUrl, tabs, selectedTab }: Props) => {
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
    {
      icon: TimelineIcon,
      name: <Trans>Timeline</Trans>,
      url: 'timeline',
    },
    ...(tabs
      ?.sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(tab => ({
        icon: tab.icon || OtherIcon,
        name: tab.title,
        url: tab.url,
      })) || []),
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

  if (selectedTab === 'events') {
    pages.push({
      icon: EventsIcon,
      name: <Trans>Events</Trans>,
      url: 'events',
    });
  }

  return (
    <nav>
      <div className="container">
        <ul>
          {pages.map(({ icon: Icon, name, url }) => (
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
};

export default NavigationBar;
