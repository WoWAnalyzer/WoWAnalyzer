import { ReactNode, type JSX } from 'react';
import cssComponent from 'interface/utils/css-component';
import styles from './HitTimeline.module.scss';
import { useAnalyzer, useInfo } from 'interface/guide';
import { formatDuration, formatNumber } from 'common/format';
import { SpellLink, Tooltip } from 'interface';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import * as MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import colorForPerformance from 'common/colorForPerformance';
import { Info } from 'parser/core/metric';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import HitBasedAnalyzer, {
  TrackedHit,
} from 'analysis/retail/demonhunter/vengeance/guide/HitBasedAnalyzer';
import Spell from 'common/SPELLS/Spell';
import useTooltip from 'interface/useTooltip';
import { abilityToSpell } from 'common/abilityToSpell';

const HitTimelineContainer = cssComponent('div', styles.HitTimelineContainer, [] as const);

const HitTimelineBar = cssComponent('div', styles.HitTimelineBar, [] as const);

const HitTimelineSlice = cssComponent('div', styles.HitTimelineSlice, [
  'color',
  'widthPct',
] as const);

interface HitTooltipContentProps {
  hit: TrackedHit;
  unmitigatedContent: ReactNode;
}

function HitTooltipContent({ hit, unmitigatedContent }: HitTooltipContentProps) {
  const info = useInfo()!;

  return (
    <div>
      <div>
        <strong>Time:</strong> {formatDuration(hit.event.timestamp - info.fightStart)}
      </div>
      <div>
        You took <strong>{formatNumber(hit.event.amount)}</strong> from{' '}
        <SpellLink spell={abilityToSpell(hit.event.ability)}>{hit.event.ability.name}</SpellLink>.
      </div>
      {!hit.mitigated && unmitigatedContent}
    </div>
  );
}

interface HitTimelineProps {
  hits: TrackedHit[];
  showSourceName?: boolean;
  unmitigatedContent: ReactNode;
}

function HitTimeline({ hits, showSourceName, unmitigatedContent }: HitTimelineProps) {
  const info = useInfo();
  const enemies = useAnalyzer(Enemies);
  const { npc: npcTooltip } = useTooltip();

  if (!info || !enemies || hits.length === 0) {
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
    <a href={npcTooltip(enemy?.guid ?? 0)} style={style}>
      {enemy?.name ?? 'Unknown'} ({ability.name})
    </a>
  ) : (
    <SpellLink spell={abilityToSpell(ability)} style={style}>
      {ability.name}
    </SpellLink>
  );

  return (
    <HitTimelineContainer>
      {link}
      <HitTimelineBar>
        {hits.map((hit, ix) => {
          return (
            <Tooltip
              hoverable
              content={<HitTooltipContent hit={hit} unmitigatedContent={unmitigatedContent} />}
              key={ix}
              direction="up"
            >
              <HitTimelineSlice
                color={colorForPerformance(Number(hit.mitigated))}
                onClick={() => console.log(hit.event)}
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

export const Highlight = cssComponent('span', styles.Highlight, ['color', 'textColor'] as const);

export const red = colorForPerformance(0);

interface HitBasedOverviewProps {
  hitBasedAnalyzer: HitBasedAnalyzer;
  spell: Spell;
  info: Info;
  unmitigatedContent: ReactNode;
}

export function HitBasedOverview({
  hitBasedAnalyzer,
  spell,
  info,
  unmitigatedContent,
}: HitBasedOverviewProps): JSX.Element {
  const uptime = uptimeBarSubStatistic(
    { start_time: info.fightStart, end_time: info.fightEnd },
    {
      spells: [spell],
      uptimes: hitBasedAnalyzer.uptime,
      color: colorForPerformance(1),
    },
  );

  const hitsBySpell = new Map<number, TrackedHit[]>();

  for (const hit of hitBasedAnalyzer.hits) {
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
    <div>
      <strong>{spell.name} Uptime</strong>
      {uptime}
      <strong>Damage Taken</strong>{' '}
      <small>
        - Hits without {spell.name} are shown in{' '}
        <Highlight color={red} textColor="white">
          red
        </Highlight>
        .
      </small>
      {Array.from(meleesBySource.entries()).map(([id, hits]) => (
        <HitTimeline
          hits={hits}
          key={id}
          showSourceName={meleesBySource.size > 1}
          unmitigatedContent={unmitigatedContent}
        />
      ))}
      {Array.from(hitsBySpell.entries()).map(([id, hits]) => (
        <HitTimeline hits={hits} key={id} unmitigatedContent={unmitigatedContent} />
      ))}
    </div>
  );
}
