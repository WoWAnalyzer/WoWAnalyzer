import colorForPerformance from 'common/colorForPerformance';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { useRef } from 'react';

import CombatLogParser from './CombatLogParser';
import './MicroTimeline.scss';

type Segment = {
  value: boolean;
  width: number;
};

function CoalescingMicroTimeline({ values }: { values: boolean[] }) {
  const initialValue: {
    currentValue?: boolean;
    currentLength: number;
    segments: Segment[];
  } = { currentLength: 0, segments: [] };
  const { segments, currentValue, currentLength } =
    values.length === 0
      ? { segments: [{ value: true, width: 1 }], currentLength: 0, currentValue: undefined }
      : values.reduce(({ currentValue, currentLength, segments }, value) => {
          if (value !== currentValue) {
            currentLength > 0 &&
              segments.push({ value: currentValue!, width: currentLength / values.length });
            return {
              currentLength: 1,
              currentValue: value,
              segments,
            };
          } else {
            return {
              currentLength: currentLength + 1,
              currentValue,
              segments,
            };
          }
        }, initialValue);

  if (currentLength > 0 && currentValue !== undefined) {
    segments.push({ value: currentValue, width: currentLength / values.length });
  }

  return (
    <div className="micro-timeline-coalescing">
      {segments.map(({ value, width }, ix) => (
        <div
          style={{
            width: `${width * 100}%`,
            backgroundColor: colorForPerformance(value ? 1 : 0),
          }}
          key={ix}
        ></div>
      ))}
    </div>
  );
}

function blockSize(numValues: number, refWidth: number = 800): number | 'coalesce' {
  const size = refWidth / numValues - 1;

  if (size < 4) {
    return 'coalesce';
  }

  return Math.min(Math.floor(size), 6);
}

function MicroTimeline({ values }: { values: boolean[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const size = blockSize(values.length, ref.current?.clientWidth);

  if (size === 'coalesce') {
    return <CoalescingMicroTimeline values={values} />;
  }

  return (
    <div className="micro-timeline-block" ref={ref}>
      {values.map((value, ix) => (
        <div
          key={ix}
          style={{
            backgroundColor: colorForPerformance(value ? 1 : 0),
            width: size,
            height: size,
          }}
        />
      ))}
    </div>
  );
}

export default function Guide({ modules }: GuideProps<typeof CombatLogParser>) {
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
            <MicroTimeline values={modules.shuffle.hits.map(({ mitigated }) => mitigated)} />
          </SubSection>
        </SubSection>
      </Section>
      <Section title="Celestial Brew"></Section>
    </>
  );
}
