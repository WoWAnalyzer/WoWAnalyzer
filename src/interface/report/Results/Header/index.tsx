import { i18n } from '@lingui/core';
import { defineMessage } from '@lingui/core/macro';
import { findZoneByBossId, type Boss } from 'game/raids';
import {
  AboutIcon,
  ArmorIcon,
  ChecklistIcon,
  EventsIcon,
  InsanityIcon,
  StatisticsIcon,
  TimelineIcon,
  MoreIcon as OtherIcon,
} from 'interface/icons';
import { isMessageDescriptor } from 'localization/isMessageDescriptor';
import type Config from 'parser/Config';
import { ParseResultsTab } from 'parser/core/Analyzer';
import type CharacterProfile from 'parser/core/CharacterProfile';
import type Fight from 'parser/core/Fight';
import { type PlayerDetails } from 'parser/core/Player';
import { ComponentType, JSX, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderBackground from './HeaderBackground';
import { currentExpansion } from 'game/GameBranch';
import * as difficulty from 'game/DIFFICULTIES';
import HeaderStatBox from './HeaderStatBox';
import { formatDuration } from 'common/format';
import FilterButton from './FilterButton';
import { Filter } from 'interface/report/hooks/useTimeEventFilter';
import Select from 'interface/controls/Select';
import useMediaQueryMatch from 'interface/hooks/useMediaQueryMatch';
import { specIconPath } from 'interface/SpecIcon';
import styles from './index.module.scss';

interface HeaderProps {
  config: Config;
  player: PlayerDetails;
  characterProfile: CharacterProfile | null;
  boss: Boss | null;
  fight: Fight;
  tabs: ParseResultsTab[];
  selectedTab: string;
  makeTabUrl: (url: string) => string;
  isLoading: boolean;
  selectedPhaseIndex: number;
  handlePhaseSelection: (phaseIndex: number) => void;
  handleTimeSelection: (startTimestamp: number, endTimestamp: number) => void;
  timeFilter: Filter | undefined;
}

interface InternalTab extends ParseResultsTab {
  icon: ComponentType;
  hidden?: boolean;
}

const standardTabs = {
  before: [
    {
      icon: ChecklistIcon,
      title: defineMessage({
        id: 'interface.report.results.navigationBar.overview',
        message: 'Overview',
      }),
      url: 'overview',
    },
    {
      icon: StatisticsIcon,
      title: defineMessage({
        id: 'interface.report.results.navigationBar.statistics',
        message: 'Statistics',
      }),
      url: 'statistics',
    },
    {
      icon: TimelineIcon,
      title: defineMessage({
        id: 'interface.report.results.navigationBar.timeline',
        message: 'Timeline',
      }),
      url: 'timeline',
    },
  ],
  after: [
    {
      icon: ArmorIcon,
      title: defineMessage({
        id: 'interface.report.results.navigationBar.character',
        message: 'Character',
      }),
      url: 'character',
    },
    {
      icon: AboutIcon,
      title: defineMessage({
        id: 'interface.report.results.navigationBar.about',
        message: 'About',
      }),
      url: 'about',
    },
    {
      icon: EventsIcon,
      title: defineMessage({
        id: 'interface.report.results.navigationBar.events',
        message: 'Events',
      }),
      url: 'events',
      hidden: true,
    },
    {
      icon: InsanityIcon,
      title: defineMessage({
        id: 'interface.report.results.navigationBar.debug',
        message: 'Debug',
      }),
      url: 'debug',
      hidden: true,
    },
  ],
} satisfies Record<string, Omit<InternalTab, 'render'>[]>;

export default function Header({
  player,
  characterProfile,
  config,
  tabs,
  selectedTab,
  makeTabUrl,
  boss,
  fight,
  isLoading,
  handlePhaseSelection,
  handleTimeSelection,
  selectedPhaseIndex,
  timeFilter,
}: HeaderProps): JSX.Element | null {
  const tabList = useMemo(
    () =>
      [
        ...standardTabs.before,
        ...tabs.map((tab) => ({ ...tab, icon: OtherIcon })),
        ...standardTabs.after,
      ] as InternalTab[],
    [tabs],
  );
  const navigate = useNavigate();

  const expansion = currentExpansion(config.branch);
  const raid = boss ? findZoneByBossId(boss.id) : undefined;

  return (
    <>
      <HeaderBackground boss={boss} raid={raid} expansion={expansion} />
      <div>
        <section className={styles.section} style={{ paddingBottom: 0 }}>
          <div className={styles.headerContainer}>
            <BossMiniBox boss={boss} fight={fight} />
            <FilterButton
              fight={fight}
              handlePhaseSelection={handlePhaseSelection}
              handleTimeSelection={handleTimeSelection}
              selectedPhaseIndex={selectedPhaseIndex}
              timeFilter={timeFilter}
            />
            <CharacterMiniBox player={player} characterProfile={characterProfile} config={config} />
            <nav className={styles.tabStrip}>
              {tabList
                .filter((tab: InternalTab) => !tab.hidden || tab.url === selectedTab)
                .map(({ icon: Icon, ...tab }) => (
                  <Link
                    key={tab.url}
                    to={makeTabUrl(tab.url)}
                    className={`${styles.tabButton}${selectedTab === tab.url ? ` ${styles.tabButtonActive}` : ''}`}
                  >
                    <Icon />
                    {isMessageDescriptor(tab.title) ? i18n._(tab.title) : tab.title}
                  </Link>
                ))}
            </nav>
            <Select
              className={styles.tabSelect}
              onChange={(event) => navigate(makeTabUrl(event.target.value))}
              value={selectedTab}
            >
              {tabList
                .filter((tab: InternalTab) => !tab.hidden || tab.url === selectedTab)
                .map((tab) => (
                  <option key={tab.url} value={tab.url}>
                    {isMessageDescriptor(tab.title) ? i18n._(tab.title) : tab.title}
                  </option>
                ))}
            </Select>
            {!isLoading && (
              <div className={styles.statBoxWrapper}>
                <HeaderStatBox />
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function CharacterMiniBox({
  player,
  characterProfile,
  config,
}: Pick<HeaderProps, 'characterProfile' | 'player' | 'config'>): JSX.Element | null {
  // intentionally smaller than the layout switch
  const showClassName = useMediaQueryMatch('(min-width: 600px)');
  return (
    <div
      className={`${styles.miniBoxContainer} ${styles.flipped}`}
      style={{ gridArea: 'character' }}
    >
      <img
        className={styles.miniBoxImage}
        src={characterProfile?.thumbnail ?? specIconPath(config.spec)}
        alt={`${player.name} (${config.spec.specName ? i18n._(config.spec.specName) : ''} ${i18n._(config.spec.className)})`}
      />
      <div className={`${styles.miniBoxName} ${config.spec.wclClassName}`}>{player.name}</div>
      <div className={styles.miniBoxSubtext}>
        {config.spec.specName ? i18n._(config.spec.specName) : null}{' '}
        {showClassName ? i18n._(config.spec.className) : null}
      </div>
    </div>
  );
}

function BossMiniBox({ boss, fight }: Pick<HeaderProps, 'boss' | 'fight'>): JSX.Element | null {
  const normalizedBossId = (boss?.id ?? fight.boss) % 50_000;
  let icon =
    boss?.icon ?? `https://assets.rpglogs.com/img/warcraft/bosses/${normalizedBossId}-icon.jpg`;

  if (!icon.startsWith('https://')) {
    // yes, it says abilities. WCL dumps WoW icons in this folder. the bosses/ folder is for images indexed by boss id, not WoW icon name
    icon = `https://assets.rpglogs.com/img/warcraft/abilities/${icon}.jpg`;
  }

  const duration = formatDuration(
    (fight.original_end_time ?? fight.end_time) - (fight.start_time - fight.offset_time),
  );
  return (
    <div className={styles.miniBoxContainer} data-testid="boss-difficulty-and-name">
      <img className={styles.miniBoxImage} src={icon} alt={boss?.name ?? fight.name} />
      <div className={styles.miniBoxName}>{boss?.name ?? fight.name}</div>
      <div className={styles.miniBoxSubtext}>
        {difficulty.getLabel(fight.difficulty ?? 0)}{' '}
        {fight.kill ? `Kill - ${duration}` : `Wipe - ${duration}`}
      </div>
    </div>
  );
}
