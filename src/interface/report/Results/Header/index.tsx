import cssComponent from 'interface/utils/css-component';
import styles from './index.module.scss';
import { i18n } from '@lingui/core';
import { defineMessage } from '@lingui/core/macro';
import { findZoneByBossId, normalizedEncounterId, type Boss } from 'game/raids';
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

const Section = cssComponent('section', styles.Section, [] as const);

const TabStrip = cssComponent('nav', styles.TabStrip, [] as const);

const TabSelect = cssComponent(Select, styles.TabSelect, [] as const);

const HeaderContainer = cssComponent('div', styles.HeaderContainer, [] as const);

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
        <Section style={{ paddingBottom: 0 }}>
          <HeaderContainer>
            <BossMiniBox boss={boss} fight={fight} />
            <FilterButton
              fight={fight}
              handlePhaseSelection={handlePhaseSelection}
              handleTimeSelection={handleTimeSelection}
              selectedPhaseIndex={selectedPhaseIndex}
              timeFilter={timeFilter}
            />
            <CharacterMiniBox player={player} characterProfile={characterProfile} config={config} />
            <TabStrip>
              {tabList
                .filter((tab: InternalTab) => !tab.hidden || tab.url === selectedTab)
                .map(({ icon: Icon, ...tab }) => (
                  <TabButton
                    key={tab.url}
                    to={makeTabUrl(tab.url)}
                    className={selectedTab === tab.url ? styles.active : ''}
                  >
                    <Icon />
                    {isMessageDescriptor(tab.title) ? i18n._(tab.title) : tab.title}
                  </TabButton>
                ))}
            </TabStrip>
            <TabSelect
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
            </TabSelect>
            {!isLoading && <HeaderStatBox className={styles.StatBoxContainer} />}
          </HeaderContainer>
        </Section>
      </div>
    </>
  );
}

const TabButton = cssComponent(Link, styles.TabButton, [] as const);

const MiniBoxContainer = cssComponent('div', styles.MiniBoxContainer, [] as const);

const MiniBoxName = cssComponent('div', styles.MiniBoxName, [] as const);

const MiniBoxSubtext = cssComponent('div', styles.MiniBoxSubtext, [] as const);

const MiniBoxImage = cssComponent('img', styles.MiniBoxImage, [] as const);

function CharacterMiniBox({
  player,
  characterProfile,
  config,
}: Pick<HeaderProps, 'characterProfile' | 'player' | 'config'>): JSX.Element | null {
  // intentionally smaller than the layout switch
  const showClassName = useMediaQueryMatch('(min-width: 600px)');
  return (
    <MiniBoxContainer className={styles.flipped} style={{ gridArea: 'character' }}>
      <MiniBoxImage
        src={characterProfile?.thumbnail ?? specIconPath(config.spec)}
        alt={`${player.name} (${config.spec.specName ? i18n._(config.spec.specName) : ''} ${i18n._(config.spec.className)})`}
      />
      <MiniBoxName className={config.spec.wclClassName}>{player.name}</MiniBoxName>
      <MiniBoxSubtext>
        {config.spec.specName ? i18n._(config.spec.specName) : null}{' '}
        {showClassName ? i18n._(config.spec.className) : null}
      </MiniBoxSubtext>
    </MiniBoxContainer>
  );
}

function BossMiniBox({ boss, fight }: Pick<HeaderProps, 'boss' | 'fight'>): JSX.Element | null {
  const normalizedBossId = normalizedEncounterId(boss?.id ?? fight.boss);
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
    <MiniBoxContainer data-testid="boss-difficulty-and-name">
      <MiniBoxImage src={icon} alt={boss?.name ?? fight.name} />
      <MiniBoxName>{boss?.name ?? fight.name}</MiniBoxName>
      <MiniBoxSubtext>
        {difficulty.getLabel(fight.difficulty ?? 0)}{' '}
        {fight.kill ? `Kill - ${duration}` : `Wipe - ${duration}`}
      </MiniBoxSubtext>
    </MiniBoxContainer>
  );
}
