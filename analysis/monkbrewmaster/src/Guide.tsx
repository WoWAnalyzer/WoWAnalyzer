import colorForPerformance from 'common/colorForPerformance';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { AnyEvent, DamageEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { useCallback, useMemo, useState } from 'react';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';

import CombatLogParser from './CombatLogParser';
import './MicroTimeline.scss';
import './HitsList.scss';
import './ProblemList.scss';
import { TrackedHit } from './modules/spells/Shuffle';

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

function PassFailBar({ pass, total }: { pass: number; total: number }) {
  const perf = pass / total;
  return (
    <div className="pass-fail-bar-container">
      <div className="pass-bar" style={{ minWidth: `${perf * 100}%` }} />
      {perf < 1 && <div className="fail-bar" style={{ minWidth: `${(1 - perf) * 100}%` }} />}
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

type Problem<T> = {
  range: { start: number; end: number };
  context:
    | number
    | {
        before: number;
        after: number;
      };
  severity?: number;
  data: T;
};

function effectiveHitSize({ mitigated, event }: TrackedHit): number {
  return mitigated
    ? 0
    : (event.amount + (event.absorbed ?? 0) + (event.overkill ?? 0)) *
        -Math.log((event.hitPoints ?? 0) / (event.maxHitPoints ?? 1)) +
        ((event.overkill ?? 0) > 0 ? 1e8 : 0);
}

function problems(hits: TrackedHit[]): Array<Problem<TrackedHit[]>> {
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

type ProblemRendererProps<T> = {
  events: AnyEvent[];
  problem: Problem<T>;
  info: Info;
};
type ProblemRenderer<T> = (props: ProblemRendererProps<T>) => JSX.Element;

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
      x: {
        field: 'timestamp',
        type: 'quantitative',
        axis: {
          labelExpr: formatTime('datum.value'),
          tickMinStep: 5000,
          grid: false,
        },
        scale: {
          nice: false,
        },
        title: null,
      },
    },
    layer: [
      {
        data: { name: 'events' },
        mark: {
          type: 'line',
          interpolate: 'monotone',
          color: '#fab700',
        },
        transform: [
          {
            calculate: `datum.timestamp - ${info.fightStart}`,
            as: 'timestamp',
          },
        ],
        encoding: {
          y: {
            field: 'hitPoints',
            type: 'quantitative',
            title: null,
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
          size: 50,
        },
        encoding: {
          y: {
            field: 'event.hitPoints',
            type: 'quantitative',
            title: null,
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

function NoProblem() {
  return (
    <div className="problem-list-container no-problems">
      <span>
        <i className="glyphicon glyphicon-ok" />
        No problems found.
      </span>
    </div>
  );
}

function ProblemList<T>({
  renderer: Component,
  problems,
  events,
  info,
}: {
  problems: Array<Problem<T>>;
  events: AnyEvent[];
  renderer: ProblemRenderer<T>;
  info: Info;
}) {
  const sortedProblems = useMemo(
    () => problems.sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0)),
    [problems],
  );
  const [problemIndex, setProblemIndex] = useState(0);
  const problem = sortedProblems[problemIndex];

  if (!problem) {
    return <NoProblem />;
  }

  const start =
    problem.range.start -
    (typeof problem.context === 'number' ? problem.context : problem.context.before);
  const end =
    problem.range.end +
    (typeof problem.context === 'number' ? problem.context : problem.context.after);
  const childEvents = events.filter(({ timestamp }) => timestamp >= start && timestamp <= end);

  return (
    <div className="problem-list-container">
      <header>
        <span>
          Problem Point {problemIndex + 1} of {sortedProblems.length}
        </span>
        <div className="btn-group">
          <button
            onClick={() => setProblemIndex(Math.max(0, problemIndex - 1))}
            disabled={problemIndex === 0}
          >
            <span className="icon-button glyphicon glyphicon-chevron-left" aria-hidden />
          </button>
          <button
            disabled={problemIndex === sortedProblems.length - 1}
            onClick={() => setProblemIndex(Math.min(sortedProblems.length - 1, problemIndex + 1))}
          >
            <span className="icon-button glyphicon glyphicon-chevron-right" aria-hidden />
          </button>
        </div>
      </header>
      <Component events={childEvents} problem={problem} info={info} />
    </div>
  );
}

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const [focusedHits, setFocusedHits] = useState<Set<TrackedHit>>(new Set());

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
              Using <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to keep the damage dealt by{' '}
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
              gridTemplateColumns: 'max-content 1fr',
              gridColumnGap: '1em',
            }}
          >
            <MicroTimeline
              style={{
                gridArea: 'timeline',
              }}
              values={modules.shuffle.hits.map((hit) => ({
                value: hit.mitigated,
                highlighted: focusedHits.has(hit),
              }))}
              onHover={(indices) =>
                setFocusedHits(
                  new Set(modules.shuffle.hits.filter((_, ix) => indices.includes(ix))),
                )
              }
            />
            <HitsList
              focusedHits={focusedHits}
              hits={modules.shuffle.hits}
              onHoverAbility={(ability) =>
                ability === null
                  ? setFocusedHits(new Set())
                  : setFocusedHits(
                      new Set(
                        modules.shuffle.hits.filter(
                          (hit) => hit.event.ability.guid === ability.guid,
                        ),
                      ),
                    )
              }
              style={{ marginTop: '1em' }}
            />
            <ProblemList
              info={info}
              renderer={TrackedHitProblem}
              events={events}
              problems={problems(modules.shuffle.hits)}
            />
          </SubSection>
        </SubSection>
      </Section>
      <Section title="Celestial Brew"></Section>
    </>
  );
}
