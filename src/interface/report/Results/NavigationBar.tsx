import { Trans } from '@lingui/macro';
import AboutIcon from 'interface/icons/About';
import ArmorIcon from 'interface/icons/Armor';
import ChecklistIcon from 'interface/icons/Checklist';
import EventsIcon from 'interface/icons/Events';
import OtherIcon from 'interface/icons/More';
import StatisticsIcon from 'interface/icons/Statistics';
import TimelineIcon from 'interface/icons/Timeline';
import { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';

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

const debug = false;

const NavigationBar = ({ makeTabUrl, tabs, selectedTab }: Props) => {
  debug && console.log(tabs, ' ------------ tabs --------------');
  const pages = [
    {
      icon: ChecklistIcon,
      name: <Trans id="interface.report.results.navigationBar.overview">Overview</Trans>,
      url: 'overview',
    },
    {
      icon: StatisticsIcon,
      name: <Trans id="interface.report.results.navigationBar.statistics">Statistics</Trans>,
      url: 'statistics',
    },
    {
      icon: TimelineIcon,
      name: <Trans id="interface.report.results.navigationBar.timeline">Timeline</Trans>,
      url: 'timeline',
    },
    ...(tabs
      ?.sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((tab) => ({
        icon: tab.icon || OtherIcon,
        name: tab.title,
        url: tab.url,
      })) || []),
    {
      icon: ArmorIcon,
      name: <Trans id="interface.report.results.navigationBar.character">Character</Trans>,
      url: 'character',
    },
    {
      icon: AboutIcon,
      name: <Trans id="interface.report.results.navigationBar.about">About</Trans>,
      url: 'about',
    },
  ];

  if (selectedTab === 'events') {
    pages.push({
      icon: EventsIcon,
      name: <Trans id="interface.report.results.navigationBar.events">Events</Trans>,
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
