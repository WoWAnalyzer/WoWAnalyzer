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
import TooltipProvider from 'interface/TooltipProvider';

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
  const lowEndPct = isMagic ? 0.3 : 0.6;
  const highEndPct = isMagic ? 0.4 : 0.7;

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

function HitTimeline({ hits, showSourceName }: { hits: TrackedHit[]; showSourceName?: boolean }) {
  const info = useInfo()!;
  const enemies = useAnalyzer(Enemies);

  if (!enemies || hits.length === 0) {
    return null;
  }

  const ability = hits[0].event.ability;
  const color = MAGIC_SCHOOLS.color(ability.type);

  const blockWidth = 1 / 120;

  const style: React.CSSProperties = {
    color,
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
  };

  const enemy = enemies.getSourceEntity(hits[0].event);

  const link = showSourceName ? (
    <a href={TooltipProvider.npc(enemy?.guid ?? 0)} style={style}>
      {enemy?.name ?? 'Unknown'} ({ability.name})
    </a>
  ) : (
    <SpellLink id={ability.guid} style={style}>
      {ability.name}
    </SpellLink>
  );

  return (
    <HitTimelineContainer>
      {link}
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

function ShuffleOverview({ shuffle, info }: { shuffle: Shuffle; info: Info }): JSX.Element {
  const uptime = uptimeBarSubStatistic(
    { start_time: info.fightStart, end_time: info.fightEnd },
    {
      spells: [SPELLS.SHUFFLE],
      uptimes: shuffle.uptime,
      color: colorForPerformance(1),
    },
  );

  const hitsBySpell = new Map<number, TrackedHit[]>();

  for (const hit of shuffle.hits) {
    let hitList = hitsBySpell.get(hit.event.ability.guid);
    if (!hitList) {
      hitList = [];
      hitsBySpell.set(hit.event.ability.guid, hitList);
    }

    hitList.push(hit);
  }

  const meleesBySource = new Map<string, TrackedHit[]>();
  for (const hit of hitsBySpell.get(1) ?? []) {
    // we intentionally ignore source instance for visual grouping
    const source = encodeTargetString(hit.event.sourceID!);
    let hitList = meleesBySource.get(source);
    if (!hitList) {
      hitList = [];
      meleesBySource.set(source, hitList);
    }

    hitList.push(hit);
  }

  // now remove melees
  hitsBySpell.delete(1);

  return (
    <>
      {uptime}
      {Array.from(meleesBySource.entries()).map(([id, hits]) => (
        <HitTimeline hits={hits} key={id} showSourceName={meleesBySource.size > 1} />
      ))}
      {Array.from(hitsBySpell.entries()).map(([id, hits]) => (
        <HitTimeline hits={hits} key={id} />
      ))}
    </>
  );
}

export default function ShuffleSection(): JSX.Element {
  const info = useInfo()!;
  const shuffle = useAnalyzer(Shuffle)!;

  return (
    <SubSection title="Shuffle">
      <SpellLink id={SPELLS.SHUFFLE.id} /> provides a significant increase to the amount of damage
      you <SpellLink id={SPELLS.STAGGER.id} />. Getting hit without{' '}
      <SpellLink id={SPELLS.SHUFFLE.id} /> active is very dangerous&mdash;and in many cases lethal.
      <SubSection title="Hits with Shuffle Active">
        <ShuffleOverview info={info} shuffle={shuffle} />
      </SubSection>
    </SubSection>
  );
}
