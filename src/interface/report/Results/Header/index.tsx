import styled from '@emotion/styled';
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
import { type PlayerInfo } from 'parser/core/Player';
import { ComponentType, JSX, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderBackground from './HeaderBackground';
import { currentExpansion } from 'game/GameBranch';
import * as difficulty from 'game/DIFFICULTIES';
import HeaderStatBox, { StatBoxContainer } from './HeaderStatBox';
import { level1, level2, colors, gaps, fontSize } from 'interface/design-system';
import { formatDuration } from 'common/format';
import FilterButton from './FilterButton';
import { Filter } from 'interface/report/hooks/useTimeEventFilter';
import Select from 'interface/controls/Select';
import useMediaQueryMatch from 'interface/hooks/useMediaQueryMatch';

const Section = styled.section`
  border: 1px solid ${level1.border};
  padding: 1rem;
  background: ${level1.background};
  box-shadow: ${level1.shadow};
  margin-bottom: 2.5rem;
`;

const TabStrip = styled.nav`
  grid-area: tabs;
`;

const TabSelect = styled(Select)`
  grid-area: tabs;
`;

const HeaderContainer = styled.div`
  display: grid;
  gap: 0.5rem 1rem;
  grid-template-rows: auto auto auto;
  grid-template-columns: repeat(2, calc(50% - ${gaps.small} / 2));
  grid-template-areas:
    'boss character'
    'filter filter'
    'tabs tabs';

  ${StatBoxContainer} {
    display: none;
  }

  ${TabStrip} {
    display: none;
  }

  @media (min-width: 750px) {
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;

    grid-template-areas:
      'boss filter character'
      'tabs tabs stats';

    align-items: end;
    justify-items: start;

    ${StatBoxContainer} {
      display: flex;
    }

    ${TabStrip} {
      display: block;
    }
    ${TabSelect} {
      display: none;
    }
  }
`;

interface HeaderProps {
  config: Config;
  player: PlayerInfo;
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
                    className={selectedTab === tab.url ? 'active' : ''}
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
            {!isLoading && <HeaderStatBox />}
          </HeaderContainer>
        </Section>
      </div>
    </>
  );
}

const TabButton = styled(Link)`
  appearance: none;
  border: none;
  background: none;

  display: inline-flex;
  gap: 0.5rem;
  flex-direction: row;
  align-items: center;

  & > svg {
    margin-top: 0;
    height: 1.25em;
    shape-rendering: geometricPrecision;
  }

  color: ${colors.bodyText};

  padding: 0.5rem 0.75rem;

  border-bottom: 3px solid ${level2.border};

  &:hover {
    background: ${level2.background};
    text-decoration: none;
    color: inherit;
    border-bottom: 3px solid color-mix(in srgb, ${colors.wowaYellow} 90%, transparent);
  }

  &.active {
    border-bottom: 3px solid ${colors.wowaYellow};
  }

  &:focus {
    color: inherit;
    text-decoration: none;
  }
`;

const MiniBoxContainer = styled.div`
  display: grid;
  gap: 0 ${gaps.medium};

  grid-template-columns: 5rem 1fr;
  grid-template-rows: max-content max-content;
  height: 5rem;

  grid-template-areas:
    'image name'
    'image subtext';

  &.flipped {
    grid-template-columns: max-content min-content;

    grid-template-areas:
      'name image'
      'subtext image';

    justify-items: end;
    justify-content: end;
    text-align: right;
  }
`;

const MiniBoxName = styled.div`
  font-size: ${fontSize.heading};
  font-weight: bold;
  white-space: break-spaces;
  overflow: hidden;
  max-height: 1lh;
`;

const MiniBoxSubtext = styled.div`
  font-size: 1.3rem;
  color: ${colors.unfocusedText};
  white-space: nowrap;
  overflow-x: hidden;
`;

const MiniBoxImage = styled.img`
  grid-area: image;
  aspect-ratio: 1 / 1;
  border: 1px solid ${level2.border};
  border-radius: 0.5rem;
  height: 5rem;
  max-height: 5rem;
`;

function CharacterMiniBox({
  player,
  characterProfile,
  config,
}: Pick<HeaderProps, 'characterProfile' | 'player' | 'config'>): JSX.Element | null {
  // intentionally smaller than the layout switch
  const showClassName = useMediaQueryMatch('(min-width: 600px)');
  return (
    <MiniBoxContainer className={'flipped'} style={{ gridArea: 'character' }}>
      <MiniBoxImage
        src={characterProfile?.thumbnail ?? `/specs/${player.icon}.jpg`.replaceAll(/ /g, '')}
        alt={player.icon}
      />
      <MiniBoxName className={player.type}>{player.name}</MiniBoxName>
      <MiniBoxSubtext>
        {config.spec.specName ? i18n._(config.spec.specName) : null}{' '}
        {showClassName ? i18n._(config.spec.className) : null}
      </MiniBoxSubtext>
    </MiniBoxContainer>
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
