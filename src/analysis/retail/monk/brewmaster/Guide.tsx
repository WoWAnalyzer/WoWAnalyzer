import colorForPerformance from 'common/colorForPerformance';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import ProblemList, { Problem, ProblemRendererProps } from 'interface/guide/shared/ProblemList';
import { AnyEvent, DamageEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import BaseChart from 'parser/ui/BaseChart';
import { useCallback, useMemo, useState } from 'react';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';

import CombatLogParser from './CombatLogParser';
import './MicroTimeline.scss';
import './HitsList.scss';
import './ProblemList.scss';
import { color, normalizeTimestampTransform, POINT_SIZE, timeAxis } from './modules/charts';
import { InvokeNiuzaoSection } from './modules/problems/InvokeNiuzao';
import { PurifySection } from './modules/problems/PurifyingBrew';
import Shuffle, { TrackedHit } from './modules/spells/Shuffle';
import talents from 'common/TALENTS/monk';
import { AplSectionData } from 'interface/guide/shared/Apl';
import * as AplCheck from './modules/core/AplCheck';
import PassFailBar from 'interface/guide/shared/PassFailBar';

type TimelineEntry = {
  value: boolean;
  highlighted: boolean;
};

type Segment = {
  value: TimelineEntry;
  width: number;
  startIx: number;
};

type MicroTimelineProps = {
  values: TimelineEntry[];
  style?: React.CSSProperties;
  onHover?: (indices: number[]) => void;
};

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_x, i) => i + start);
}

function CoalescingMicroTimeline({
  values,
  onHover,
  onRender,
  style,
}: MicroTimelineProps & {
  onRender: (node: HTMLDivElement) => void;
}) {
  const initialValue: {
    startIx?: number;
    currentValue?: TimelineEntry;
    currentLength: number;
    segments: Segment[];
  } = { currentLength: 0, segments: [] };

  const defaultValue = {
    segments: [{ value: { value: true, highlighted: false }, width: 1, startIx: 0 }],
    currentLength: 0,
    currentValue: undefined,
    startIx: undefined,
  };

  const { segments, currentValue, currentLength, startIx } =
    values.length === 0
      ? defaultValue
      : values.reduce(({ startIx, currentValue, currentLength, segments }, value, ix) => {
          if (value.value !== currentValue?.value) {
            currentLength > 0 &&
              segments.push({
                startIx: startIx!,
                value: currentValue!,
                width: currentLength,
              });
            return {
              currentLength: 1,
              currentValue: value,
              segments,
              startIx: ix,
            };
          } else {
            return {
              startIx,
              currentLength: currentLength + 1,
              currentValue: {
                ...currentValue,
                highlighted: currentValue.highlighted || value.highlighted,
              },
              segments,
            };
          }
        }, initialValue);

  if (currentLength > 0) {
    segments.push({
      value: currentValue!,
      width: currentLength,
      startIx: startIx!,
    });
  }

  return (
    <div className="micro-timeline-coalescing" ref={onRender} style={style}>
      {segments.map(({ value, width, startIx }, ix) => (
        <div
          className={value.highlighted ? 'focused' : ''}
          style={{
            width: `${(width / (values.length ?? 1)) * 100}%`,
            backgroundColor: colorForPerformance(value ? 1 : 0),
          }}
          onMouseEnter={() => onHover?.(range(startIx, startIx + width))}
          onMouseLeave={() => onHover?.([])}
          key={ix}
        ></div>
      ))}
    </div>
  );
}

function blockSize(numValues: number, refWidth: number): number | 'coalesce' {
  const size = refWidth / numValues - 1;

  if (size < 5) {
    return 'coalesce';
  }

  return Math.min(Math.floor(size), 8);
}

function MicroTimeline({ values, onHover, style }: MicroTimelineProps) {
  const [refWidth, setRefWidth] = useState(800);
  const ref = useCallback((node: HTMLDivElement) => {
    node && setRefWidth(node.getBoundingClientRect().width);
  }, []);
  const size = blockSize(values.length, refWidth);

  if (size === 'coalesce') {
    return (
      <CoalescingMicroTimeline values={values} onRender={ref} onHover={onHover} style={style} />
    );
  }

  return (
    <div className="micro-timeline-block" ref={ref} style={style}>
      {values.map((value, ix) => (
        <div
          key={ix}
          onMouseEnter={() => onHover?.([ix])}
          onMouseLeave={() => onHover?.([])}
          className={value.highlighted ? 'focused' : ''}
          style={{
            backgroundColor: colorForPerformance(value.value ? 1 : 0),
            width: size,
            height: size,
          }}
        />
      ))}
    </div>
  );
}

type HitData = {
  ability: DamageEvent['ability'];
  total: number;
  pass: number;
  focused: boolean;
};

function HitsList({
  hits,
  style,
  focusedHits,
  onHoverAbility,
}: {
  hits: TrackedHit[];
  style?: React.CSSProperties;
  focusedHits: Set<TrackedHit>;
  onHoverAbility?: (ability: DamageEvent['ability'] | null) => void;
}) {
  const byAbility = hits.reduce<{ [key: number]: HitData }>((byAbility, hit) => {
    const { event, mitigated } = hit;
    const datum = byAbility[event.ability.guid] ?? {
      ability: event.ability,
      total: 0,
      pass: 0,
      focused: false,
    };

    datum.focused = datum.focused || focusedHits.has(hit);
    datum.total += 1;
    datum.pass += mitigated ? 1 : 0;

    byAbility[event.ability.guid] = datum;

    return byAbility;
  }, {});

  return (
    <table className="hits-list" style={style}>
      <tbody>
        {Object.values(byAbility)
          .sort((a, b) => b.total - a.total)
          .map(({ ability, total, pass, focused }) => (
            <tr
              key={ability.guid}
              onMouseEnter={() => onHoverAbility?.(ability)}
              onMouseLeave={() => onHoverAbility?.(null)}
            >
              <td className={focused ? 'focused' : ''}>
                {ability.guid > 1 ? <SpellLink id={ability.guid} /> : ability.name}
              </td>
              <td className={`pass-fail-counts ${focused ? 'focused' : ''}`}>
                {pass} / {total}
              </td>
              <td className={focused ? 'focused' : ''}>
                <PassFailBar pass={pass} total={total} />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

function effectiveHitSize({ mitigated, event }: TrackedHit): number {
  return mitigated
    ? 0
    : (event.amount + (event.absorbed ?? 0) + (event.overkill ?? 0)) *
        -Math.log((event.hitPoints ?? 0) / (event.maxHitPoints ?? 1)) +
        ((event.overkill ?? 0) > 0 ? 1e8 : 0);
}

function shuffleProblems(hits: TrackedHit[]): Array<Problem<TrackedHit[]>> {
  let current: Problem<TrackedHit[]> | undefined = undefined;
  const allProblems: Array<Problem<TrackedHit[]>> = [];

  hits.forEach((hit) => {
    if (hit.mitigated && !current) {
      return;
    }

    if (!hit.mitigated && !current) {
      current = {
        range: {
          start: hit.event.timestamp,
          end: hit.event.timestamp,
        },
        severity: effectiveHitSize(hit),
        data: [hit],
        context: 10000,
      };
      return;
    }

    if (current && hit.event.timestamp - current.range.end <= 10000) {
      if (!hit.mitigated) {
        current.range.end = hit.event.timestamp;
      }
      current.data.push(hit);
      current.severity = (current.severity ?? 0) + effectiveHitSize(hit);
      return;
    } else if (current) {
      allProblems.push(current);
      current = undefined;
    }
  });

  return allProblems;
}

function TrackedHitProblem({ problem, events, info }: ProblemRendererProps<TrackedHit[]>) {
  const playerEvents = events.filter(
    (event) =>
      (event.type === 'damage' || event.type === 'heal') &&
      event.targetID === info.playerId &&
      event.hitPoints !== undefined,
  );
  const data = {
    events: playerEvents,
    problems: problem.data.map((hit) => {
      if (hit.event.hitPoints) {
        return hit;
      }
      const event = {
        ...hit.event,
      };

      for (const prior of playerEvents) {
        if (prior.timestamp > event.timestamp) {
          break;
        }

        event.hitPoints = 'hitPoints' in prior ? prior.hitPoints : event.hitPoints;
        event.maxHitPoints = 'maxHitPoints' in prior ? prior.maxHitPoints : event.maxHitPoints;
      }

      return { ...hit, event };
    }),
  };

  const spec: VisualizationSpec = {
    encoding: {
      x: timeAxis,
    },
    layer: [
      {
        data: { name: 'events' },
        mark: {
          type: 'line',
          interpolate: 'step-after',
          color: color.stagger,
        },
        transform: [normalizeTimestampTransform(info)],
        encoding: {
          y: {
            field: 'hitPoints',
            type: 'quantitative',
            title: 'Hit Points',
            axis: {
              gridOpacity: 0.3,
              format: '~s',
            },
          },
        },
      },
      {
        data: { name: 'problems' },
        transform: [
          {
            calculate: `datum.event.timestamp - ${info.fightStart}`,
            as: 'timestamp',
          },
          {
            calculate:
              'datum.event.amount + if(datum.event.absorb, datum.event.absorb, 0) + if(datum.event.overkill, datum.event.overkill, 0)',
            as: 'totalAmount',
          },
          {
            calculate:
              '1 - datum.totalAmount / if(datum.event.unmitigatedAmount, datum.event.unmitigatedAmount, 1)',
            as: 'mitPct',
          },
          {
            calculate: 'datum.event.hitPoints + datum.event.amount',
            as: 'priorHitPoints',
          },
        ],
        mark: {
          type: 'point',
          filled: true,
          opacity: 1,
          size: POINT_SIZE,
        },
        encoding: {
          y: {
            field: 'event.hitPoints',
            type: 'quantitative',
            title: 'Hit Points',
            axis: {
              gridOpacity: 0.3,
              format: '~s',
            },
          },
          color: {
            field: 'mitigated',
            type: 'nominal',
            title: null,
            legend: null,
            scale: {
              domain: [false, true],
              range: ['red', '#00ff96'],
            },
          },
          tooltip: [
            {
              field: 'event.ability.name',
              type: 'nominal',
              title: 'Damaging Ability',
            },
            {
              field: 'priorHitPoints',
              type: 'quantitative',
              title: 'Hit Points',
              format: '.3~s',
            },
            {
              field: 'totalAmount',
              type: 'quantitative',
              title: 'Damage Taken',
              format: '.3~s',
            },
            {
              field: 'mitPct',
              type: 'quantitative',
              title: '% Mitigated',
              format: '.3~p',
            },
          ],
        },
      },
    ],
  };

  return (
    <AutoSizer disableHeight>
      {({ width }) => <BaseChart data={data} width={width} height={150} spec={spec} />}
    </AutoSizer>
  );
}

const shuffleTimelineStyle = {
  gridArea: 'timeline',
};

function ShuffleOverview({
  shuffle,
  events,
  info,
}: {
  shuffle: Shuffle;
  events: AnyEvent[];
  info: Info;
}): JSX.Element {
  const [focusedHits, setFocusedHits] = useState<Set<TrackedHit>>(new Set());

  const hitList = useMemo(
    () =>
      shuffle.hits.map((hit) => ({
        value: hit.mitigated,
        highlighted: focusedHits.has(hit),
      })),
    [shuffle.hits, focusedHits],
  );

  const onHoverTimeline = useCallback(
    (indices) => setFocusedHits(new Set(shuffle.hits.filter((_, ix) => indices.includes(ix)))),
    [shuffle.hits, setFocusedHits],
  );

  const onHoverAbility = useCallback(
    (ability) =>
      ability === null
        ? setFocusedHits(new Set())
        : setFocusedHits(
            new Set(shuffle.hits.filter((hit) => hit.event.ability.guid === ability.guid)),
          ),
    [setFocusedHits, shuffle.hits],
  );

  return (
    <>
      <MicroTimeline style={shuffleTimelineStyle} values={hitList} onHover={onHoverTimeline} />
      <HitsList
        focusedHits={focusedHits}
        hits={shuffle.hits}
        onHoverAbility={onHoverAbility}
        style={{ marginTop: '1em' }}
      />
    </>
  );
}

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const shuffleProblemList = useMemo(() => shuffleProblems(modules.shuffle.hits), [
    modules.shuffle.hits,
  ]);

  return (
    <>
      <Section title="Stagger Management">
        <p>
          <SpellLink id={SPELLS.STAGGER.id} /> spreads a portion of damage taken over a 10 second
          window. In doing so, it makes Brewmasters easy to heal&mdash;as long as you manage it
          well. There are two key elements to managing <SpellLink id={SPELLS.STAGGER.id} />:
          <ul>
            <li>
              Maintaining <SpellLink id={SPELLS.SHUFFLE.id} /> to improve the amount of damage that
              is Staggered.
            </li>
            <li>
              Using <SpellLink id={talents.PURIFYING_BREW_TALENT.id} /> to keep the damage dealt by{' '}
              <SpellLink id={SPELLS.STAGGER.id} /> from getting too high.
            </li>
          </ul>
        </p>
        <SubSection title="Shuffle">
          <SpellLink id={SPELLS.SHUFFLE.id} /> provides a significant increase to the amount of
          damage you <SpellLink id={SPELLS.STAGGER.id} />. Getting hit without{' '}
          <SpellLink id={SPELLS.SHUFFLE.id} /> active is very dangerous&mdash;and in many cases
          lethal.
          <SubSection
            title="Hits with Shuffle Active"
            style={{
              display: 'grid',
              gridTemplateAreas: "'timeline timeline' 'hits-list problem-list'",
              gridTemplateColumns: 'minmax(40%, max-content) 1fr',
              gridColumnGap: '1em',
            }}
          >
            <ShuffleOverview events={events} info={info} shuffle={modules.shuffle} />
            <ProblemList
              info={info}
              renderer={TrackedHitProblem}
              events={events}
              problems={shuffleProblemList}
            />
          </SubSection>
        </SubSection>
        <PurifySection module={modules.purifyProblems} events={events} info={info} />
      </Section>
      <Section title="Rotation">
        <p>
          The Brewmaster rotation is driven by a <em>priority list</em>. When you are ready to use
          an ability, you should use the highest-priority ability that is available. Doing this
          improves your damage by prioritizing high-damage, high-impact spells like{' '}
          <SpellLink id={talents.RISING_SUN_KICK_TALENT.id} /> and{' '}
          <SpellLink id={talents.KEG_SMASH_TALENT.id} /> over low-priority "filler" spells like{' '}
          <SpellLink id={SPELLS.TIGER_PALM.id} />.
        </p>
        <AplSectionData checker={AplCheck.check} apl={AplCheck.apl} />
      </Section>
      <InvokeNiuzaoSection
        events={events}
        info={info}
        module={modules.invokeNiuzao}
        // this cast is necessary because the defaultModules are not properly indexed.
        // combination of static methods + inheritance issues.
        castEfficiency={modules.CastEfficiency as CastEfficiency}
      />
    </>
  );
}
