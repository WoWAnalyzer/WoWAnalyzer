import { useState, type JSX } from 'react';
import clsx from 'clsx';
import cssComponent from 'interface/utils/css-component';
import styles from './TigersFuryWindowsSection.module.scss';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellIcon, SpellLink } from 'interface';
import { SubSection } from 'interface/guide';
import Button from 'interface/controls/Button';
import { formatNumber } from 'common/format';
import type CombatLogParser from 'parser/core/CombatLogParser';
import { FB_IDS } from 'analysis/retail/druid/feral/constants';
import type { TfWindow, WindowCast } from './TigersFuryWindows';

const COLLAPSED_CAST_LIMIT = 6;

const BUILDER_IDS = new Set<number>([
  SPELLS.SHRED.id,
  SPELLS.RAKE.id,
  SPELLS.SWIPE_CAT.id,
  SPELLS.MOONFIRE_FERAL.id,
  TALENTS_DRUID.FERAL_FRENZY_TALENT.id,
]);

const WindowList = cssComponent('div', styles.WindowList, [] as const);

const ShowMoreButton = cssComponent(Button, styles.ShowMoreButton, [] as const);

interface TigersFuryWindowsSectionProps {
  windows: TfWindow[];
  owner: CombatLogParser;
}

export default function TigersFuryWindowsSection({
  windows,
  owner,
}: TigersFuryWindowsSectionProps): JSX.Element {
  const [showAll, setShowAll] = useState(false);
  const restCount = Math.max(0, windows.length - 1);
  const visibleWindows = showAll ? windows : windows.slice(0, 1);

  return (
    <SubSection title="Tiger's Fury Windows">
      <p>
        Every <SpellLink spell={SPELLS.TIGERS_FURY} /> window below shows the casts you fit into it.
        Auto-attacks are hidden. Casts triggered by{' '}
        <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> are dimmed since they aren't
        part of your manual rotation. The first window is shown as an example; use the button below
        to reveal the rest.
      </p>
      {windows.length === 0 ? (
        <p>
          <em>No Tiger's Fury casts in this fight.</em>
        </p>
      ) : (
        <>
          <WindowList>
            {visibleWindows.map((win, i) => (
              <TfWindowCard key={i} window={win} owner={owner} />
            ))}
          </WindowList>
          {restCount > 0 && (
            <ShowMoreButton onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Collapse Windows' : `Show Windows (${restCount} more)`}
            </ShowMoreButton>
          )}
        </>
      )}
    </SubSection>
  );
}

const WindowCard = cssComponent('div', styles.WindowCard, [] as const);

const WindowIconContainer = cssComponent('div', styles.WindowIconContainer, [] as const);

const WindowBody = cssComponent('div', styles.WindowBody, [] as const);

const WindowHeader = cssComponent('div', styles.WindowHeader, [] as const);

const WindowTitle = cssComponent('strong', styles.WindowTitle, [] as const);

const WindowSummary = cssComponent('small', styles.WindowSummary, [] as const);

const NoCasts = cssComponent('em', styles.NoCasts, [] as const);

const CastList = cssComponent('ol', styles.CastList, [] as const);

const ExpandCastsLink = cssComponent('a', styles.ExpandCastsLink, [] as const);

const WindowStats = cssComponent('div', styles.WindowStats, [] as const);

const PrimaryStat = cssComponent('div', styles.PrimaryStat, [] as const);

const SecondaryStat = cssComponent('div', styles.SecondaryStat, [] as const);

const StatLabel = cssComponent('div', styles.StatLabel, [] as const);

interface TfWindowCardProps {
  window: TfWindow;
  owner: CombatLogParser;
}

function TfWindowCard({ window: win, owner }: TfWindowCardProps): JSX.Element {
  const [castsExpanded, setCastsExpanded] = useState(false);
  const castsCollapsible = win.casts.length > COLLAPSED_CAST_LIMIT;
  const visibleCasts = castsExpanded ? win.casts : win.casts.slice(0, COLLAPSED_CAST_LIMIT);

  const startLabel = owner.formatTimestamp(win.castTimestamp);
  const endLabel = owner.formatTimestamp(win.castTimestamp + win.durationMs);

  const fbCount = win.casts.filter((c) => FB_IDS.includes(c.spellId)).length;
  const ripCount = win.casts.filter((c) => c.spellId === SPELLS.RIP.id).length;
  const builderCount = win.casts.filter((c) => BUILDER_IDS.has(c.spellId)).length;

  return (
    <WindowCard>
      <WindowIconContainer>
        <SpellIcon spell={SPELLS.TIGERS_FURY} />
      </WindowIconContainer>
      <WindowBody>
        <WindowHeader>
          <WindowTitle>
            Tiger's Fury ({startLabel} → {endLabel})
          </WindowTitle>
          <WindowSummary>
            started at {win.energyAtStart} energy / {win.cpsAtStart} CPs · {builderCount} builder
            {builderCount === 1 ? '' : 's'} · {fbCount}{' '}
            <SpellLink spell={SPELLS.FEROCIOUS_BITE} icon={false}>
              FB
            </SpellLink>
            {ripCount > 0 && (
              <>
                {' '}
                · {ripCount}{' '}
                <SpellLink spell={SPELLS.RIP} icon={false}>
                  Rip
                </SpellLink>
              </>
            )}
          </WindowSummary>
        </WindowHeader>

        {win.casts.length === 0 ? (
          <NoCasts>No casts during this window.</NoCasts>
        ) : (
          <>
            <CastList>
              {visibleCasts.map((cast, i) => (
                <CastRow key={i} cast={cast} />
              ))}
            </CastList>
            {castsCollapsible && (
              <ExpandCastsLink onClick={() => setCastsExpanded((v) => !v)}>
                {castsExpanded
                  ? 'Show less'
                  : `Show more (${win.casts.length - COLLAPSED_CAST_LIMIT})`}
              </ExpandCastsLink>
            )}
          </>
        )}
      </WindowBody>
      <WindowStats>
        <PrimaryStat title="Damage attributable specifically to TF's damage bonus, for boosted hits landing in this window.">
          {formatNumber(win.tfBonusDamage)}
          <StatLabel>damage from TF</StatLabel>
        </PrimaryStat>
        <SecondaryStat title="Total damage you dealt during this Tiger's Fury window (any spell, boosted or not).">
          {formatNumber(win.totalDamage)}
          <StatLabel>total in window</StatLabel>
        </SecondaryStat>
      </WindowStats>
    </WindowCard>
  );
}

function CastRow({ cast }: { cast: WindowCast }): JSX.Element {
  const offsetSec = cast.offsetMs / 1000;
  return (
    <li className={clsx(styles.CastRow, { [styles.fromConvoke]: cast.fromConvoke })}>
      <span className={styles.CastOffset}>+{offsetSec.toFixed(3)}</span>
      <SpellIcon spell={cast.spellId} noLink />
      <SpellLink spell={cast.spellId} icon={false}>
        {cast.spellName}
      </SpellLink>
    </li>
  );
}
