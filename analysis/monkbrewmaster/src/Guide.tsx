import colorForPerformance from 'common/colorForPerformance';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { DamageEvent } from 'parser/core/Events';
import { useCallback, useState } from 'react';

import CombatLogParser from './CombatLogParser';
import './MicroTimeline.scss';
import './HitsList.scss';
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
  onHover?: (indices: number[]) => void;
};

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_x, i) => i + start);
}

function CoalescingMicroTimeline({
  values,
  onHover,
  onRender,
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
    <div className="micro-timeline-coalescing" ref={onRender}>
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

function MicroTimeline({ values, onHover }: MicroTimelineProps) {
  const [refWidth, setRefWidth] = useState(800);
  const ref = useCallback((node: HTMLDivElement) => {
    node && setRefWidth(node.getBoundingClientRect().width);
  }, []);
  const size = blockSize(values.length, refWidth);

  if (size === 'coalesce') {
    return <CoalescingMicroTimeline values={values} onRender={ref} onHover={onHover} />;
  }

  return (
    <div className="micro-timeline-block" ref={ref}>
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

export default function Guide({ modules }: GuideProps<typeof CombatLogParser>) {
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
          <SubSection title="Hits with Shuffle Active">
            <MicroTimeline
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
          </SubSection>
        </SubSection>
      </Section>
      <Section title="Celestial Brew"></Section>
    </>
  );
}
