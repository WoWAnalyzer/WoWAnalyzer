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
      name: <>Overview</>,
      url: 'overview',
    },
    {
      icon: StatisticsIcon,
      name: <>Statistics</>,
      url: 'statistics',
    },
    {
      icon: TimelineIcon,
      name: <>Timeline</>,
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
      name: <>Character</>,
      url: 'character',
    },
    {
      icon: AboutIcon,
      name: <>About</>,
      url: 'about',
    },
  ];

  if (selectedTab === 'events') {
    pages.push({
      icon: EventsIcon,
      name: <>Events</>,
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
