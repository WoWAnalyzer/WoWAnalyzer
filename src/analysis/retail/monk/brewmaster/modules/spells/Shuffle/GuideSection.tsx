import { useMemo } from 'react';
import styled from '@emotion/styled';
import colorForPerformance from 'common/colorForPerformance';
import SPELLS from 'common/SPELLS';
import { SpellLink, Tooltip } from 'interface';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import { Info } from 'parser/core/metric';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import Shuffle, { TrackedHit } from './index';
import * as MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import talents from 'common/TALENTS/monk';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import { AbilityEvent, SourcedEvent } from 'parser/core/Events';
import useTooltip from 'interface/useTooltip';

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

function HitTooltipContent({ hit }: { hit: TrackedHit }) {
  const info = useInfo()!;

  const isMagic = hit.event.ability.type !== MAGIC_SCHOOLS.default.ids.PHYSICAL;

  // Stagger absorb is 170-180% as strong with Shuffle up within the range of
  // reasonable Agility values. This works out to 60-70% "damage reduction"
  const modifier = isMagic ? 0.45 : 1;
  const lowEndPct = 0.6 * modifier;
  const highEndPct = 0.7 * modifier;

  return (
    <div>
      <div>
        <strong>Time:</strong> {formatDuration(hit.event.timestamp - info.fightStart)}
      </div>
      <div>
        You took <strong>{formatNumber(hit.event.amount)}</strong> from{' '}
        <SpellLink id={hit.event.ability.guid}>{hit.event.ability.name}</SpellLink>.
      </div>
      {!hit.mitigated && (
        <div>
          <SpellLink id={SPELLS.SHUFFLE} /> would have reduced this by{' '}
          <strong>
            {formatPercentage(lowEndPct, 0)}&ndash;{formatPercentage(highEndPct, 0)}%
          </strong>{' '}
          (to {formatNumber((1 - highEndPct) * hit.event.amount)}&ndash;
          {formatNumber((1 - lowEndPct) * hit.event.amount)}) by increasing the amount absorbed by{' '}
          <SpellLink id={talents.STAGGER_TALENT} />.
        </div>
      )}
    </div>
  );
}

const damageSourceStyle: React.CSSProperties = {
  overflowX: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
};

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
      <SpellLink id={ability.guid} style={style}>
        {ability.name}
      </SpellLink>
    );
  }
}

function HitTimeline({ hits, showSourceName }: { hits: TrackedHit[]; showSourceName?: boolean }) {
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
            <Tooltip hoverable content={<HitTooltipContent hit={hit} />} key={ix} direction="up">
              <HitTimelineSlice
                color={colorForPerformance(Number(hit.mitigated))}
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

export const Highlight = styled.span<{ color: string; textColor?: string }>`
  background-color: ${(props) => props.color};
  padding: 0 3px;
  ${(props) => (props.textColor ? `color: ${props.textColor};` : '')}
`;

const red = colorForPerformance(0);

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

function ShuffleOverview({ shuffle, info }: { shuffle: Shuffle; info: Info }): JSX.Element {
  const uptime = uptimeBarSubStatistic(
    { start_time: info.fightStart, end_time: info.fightEnd },
    {
      spells: [SPELLS.SHUFFLE],
      uptimes: shuffle.uptime,
      color: colorForPerformance(1),
    },
  );

  const hitsBySpellRaw = damageBreakdown(
    shuffle.hits,
    (hit: TrackedHit) => hit.event.ability.guid,
    (hit: TrackedHit) => encodeTargetString(hit.event.sourceID ?? 0),
  );

  const meleesBySource = hitsBySpellRaw.get(1) ?? new Map();

  return (
    <div>
      <strong>Shuffle Uptime</strong>
      {uptime}
      <strong>Damage Taken</strong>{' '}
      <small>
        - Hits without Shuffle are shown in{' '}
        <Highlight color={red} textColor="white">
          red
        </Highlight>
        .
      </small>
      {Array.from(meleesBySource.entries()).map(([id, hits]) => (
        <HitTimeline hits={hits} key={id} showSourceName={meleesBySource.size > 1} />
      ))}
      {Array.from(hitsBySpellRaw.entries())
        .filter(([id]) => id !== 1)
        .map(([id, hits]) => (
          <HitTimeline hits={Array.from(hits.values()).flat()} key={id} />
        ))}
    </div>
  );
}

export default function ShuffleSection(): JSX.Element {
  const info = useInfo()!;
  const shuffle = useAnalyzer(Shuffle)!;

  return (
    <SubSection title="Shuffle">
      <ExplanationRow>
        <Explanation>
          <p>
            <SpellLink id={SPELLS.SHUFFLE} /> nearly <strong>doubles</strong> the amount of damage
            that is absorbed by <SpellLink id={talents.STAGGER_TALENT} />, and is critical to have
            up while tanking. It is applied automatically by your core rotational abilities&mdash;so
            as long as you are doing your rotation, you should have{' '}
            <SpellLink id={SPELLS.SHUFFLE} />.
          </p>
          <p>
            This chart shows your <SpellLink id={SPELLS.SHUFFLE} /> uptime along with the damage
            that you took. <strong>You do not need 100% uptime!</strong> However, damage taken
            without <SpellLink id={SPELLS.SHUFFLE} /> active (shown in{' '}
            <Highlight color={red}>red</Highlight>) is very dangerous!
          </p>
        </Explanation>
        <ShuffleOverview info={info} shuffle={shuffle} />
      </ExplanationRow>
    </SubSection>
  );
}
