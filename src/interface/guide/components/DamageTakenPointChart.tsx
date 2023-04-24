/**
 * This component implements the damage taken "point" chart. The points are boxes,
 * but it has more in common with a point type than a "boxplot", so it is named a
 * point chart to avoid confusion on that front.
 *
 * To use this in your guide, collect an array of `TrackedHit`s in one of your analyzers,
 * then pass it here.
 * @module
 */
import { useMemo } from 'react';
import styled from '@emotion/styled';
import * as MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import useTooltip from 'interface/useTooltip';
import { AbilityEvent, DamageEvent, SourcedEvent } from 'parser/core/Events';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import { qualitativePerformanceToColor, useAnalyzer, useInfo } from '../index';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export type TrackedHit = {
  /** How good a job the player did of mitigating the tracked hit */
  mitigated: QualitativePerformance;
  /** Incoming damage event to the player */
  event: DamageEvent;
};

/**
 * Calculate the damage breakdown by source for the set of data `T`.
 *
 * The result is a map from `spellId -> sourceKey -> T`.
 *
 * This is used by the chart with preset values for `TrackedHit`, but
 * may be used elsewhere as well.
 */
export function damageBreakdown<T>(
  data: T[],
  selectSpellId: (datum: T) => number,
  selectSource: (datum: T) => string,
): Map<number, Map<string, T[]>> {
  const bySpell = new Map();
  for (const datum of data) {
    const ability = selectSpellId(datum);
    let bySource = bySpell.get(ability);
    if (!bySource) {
      bySource = new Map();
      bySpell.set(ability, bySource);
    }

    const source = selectSource(datum);
    let hits = bySource.get(source);
    if (!hits) {
      hits = [];
      bySource.set(source, hits);
    }

    hits.push(datum);
  }

  return bySpell;
}

export type DamageTakenPointChartProps = {
  hits: TrackedHit[];
  tooltip: React.FC<{ hit: TrackedHit }>;
};

type Props = DamageTakenPointChartProps;

const HitTimelineContainer = styled.div`
  display: grid;
  grid-template-columns: calc(150px - 1rem) 1fr;
  gap: 1rem;
  height: 20px;
  padding: 0 10px;
  margin: 5px 0;

  & > :first-child {
    justify-self: start;
    align-self: start;
    padding-left: 1rem;
  }
`;

const HitTimelineBar = styled.div`
  position: relative;
  width: 100%;
  height: 20px;
`;

const HitTimelineSlice = styled.div<{
  color: string;
  widthPct: number;
}>`
  width: max(1px, ${(props) => props.widthPct * 100}%);
  background-color: ${(props) => props.color};
  height: 100%;
  position: absolute;
  top: 0;
  border: 1px solid black;
  box-sizing: content-box;
`;

const damageSourceStyle: React.CSSProperties = {
  overflowX: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
};

/**
 * A `SpellLink` wrapper that knows how to include the source name.
 *
 * Only works within the `Guide` context current, as it relies on
 * `useAnalyzer` and needs the `Enemies` analyzer to be present.
 */
export function DamageSourceLink({
  event,
  showSourceName,
}: {
  event: AbilityEvent<any> & Partial<SourcedEvent<any>>;
  showSourceName?: boolean;
}): JSX.Element | null {
  const enemies = useAnalyzer(Enemies);

  const ability = event.ability;
  const color = MAGIC_SCHOOLS.color(ability.type);

  // this prevents unneeded re-renders of child components due to object identity differences
  const style = useMemo(() => ({ ...damageSourceStyle, color }), [color]);
  const { npc: npcTooltip } = useTooltip();

  if (showSourceName) {
    const enemy = enemies?.getSourceEntity(event);
    return (
      <a href={npcTooltip(enemy?.guid ?? 0)} style={style}>
        {enemy?.name ?? 'Unknown'} ({ability.name})
      </a>
    );
  } else {
    return (
      <SpellLink spell={ability.guid} style={style}>
        {ability.name}
      </SpellLink>
    );
  }
}

function HitTimeline({
  hits,
  showSourceName,
  tooltip: TooltipContent,
}: Props & { showSourceName?: boolean }) {
  const info = useInfo()!;
  const enemies = useAnalyzer(Enemies);

  if (!enemies || hits.length === 0) {
    return null;
  }
  const blockWidth = 1 / 120;

  return (
    <HitTimelineContainer>
      <DamageSourceLink showSourceName={showSourceName} event={hits[0].event} />
      <HitTimelineBar>
        {hits.map((hit, ix) => {
          return (
            <Tooltip hoverable content={<TooltipContent hit={hit} />} key={ix} direction="up">
              <HitTimelineSlice
                color={qualitativePerformanceToColor(hit.mitigated)}
                widthPct={blockWidth}
                style={{
                  left: `${((hit.event.timestamp - info.fightStart) / info.fightDuration) * 100}%`,
                }}
              />
            </Tooltip>
          );
        })}
      </HitTimelineBar>
    </HitTimelineContainer>
  );
}

/**
 * Damage Taken chart shown as a single point for each hit. See the Brewmaster Shuffle section
 * for an example of what this looks like.
 *
 * This chart must be rendered within a `Guide` context and have the `Enemies` core analyzer
 * present. If you haven't explicitly removed `Enemies` from your analyzer (which you probably
 * haven't and shouldn't!) then it should Just Work:tm:.
 *
 * Note that the `tooltip` component is *required* and that this is intentional.
 */
export default function DamageTakenPointChart({ hits, tooltip }: Props): JSX.Element {
  const hitsBySpellRaw = damageBreakdown(
    hits,
    (hit: TrackedHit) => hit.event.ability.guid,
    (hit: TrackedHit) => encodeTargetString(hit.event.sourceID ?? 0),
  );

  const meleesBySource = hitsBySpellRaw.get(1) ?? new Map();

  return (
    <div>
      {Array.from(meleesBySource.entries()).map(([id, hits]) => (
        <HitTimeline
          hits={hits}
          key={id}
          showSourceName={meleesBySource.size > 1}
          tooltip={tooltip}
        />
      ))}
      {Array.from(hitsBySpellRaw.entries())
        .filter(([id]) => id !== 1)
        .map(([id, hits]) => (
          <HitTimeline hits={Array.from(hits.values()).flat()} key={id} tooltip={tooltip} />
        ))}
    </div>
  );
}
