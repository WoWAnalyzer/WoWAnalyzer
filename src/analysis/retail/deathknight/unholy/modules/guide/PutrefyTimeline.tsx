import DK_SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import EmbeddedTimeline from 'interface/report/Results/Timeline/EmbeddedTimeline';
import { useState } from 'react';
import styles from './PutrefyTimeline.module.scss';

export interface PutrefyCastEntry {
  timestamp: number;
  duringDarkTransformation: boolean;
  chargesSpent: number;
  chargesBeforeCast: number;
  maxCharges: number;
  darkTransformationCooldownRemaining: number;
  nextChargeRemaining: number | null;
}

interface Props {
  entries: PutrefyCastEntry[];
  fightStart: number;
  fightEnd: number;
  formatTimestamp: (timestamp: number) => string;
}

const AURAS = [DK_SPELLS.DARK_TRANSFORMATION_BUFF];

export default function PutrefyTimeline({ entries, fightStart, fightEnd, formatTimestamp }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const index = Math.min(selectedIndex, entries.length - 1);
  const entry = entries[index];

  if (!entry) {
    return <p>No outside-window Putrefy casts to review.</p>;
  }

  const range = {
    start: Math.max(fightStart, entry.timestamp - 10000),
    end: Math.min(
      fightEnd,
      entry.timestamp + Math.max(15000, entry.darkTransformationCooldownRemaining + 10000),
    ),
  };

  return (
    <section className={styles.review} aria-label="Outside-window Putrefy cast review">
      <div className={styles.navigation}>
        <button
          className={styles.control}
          type="button"
          disabled={index === 0}
          onClick={() => setSelectedIndex(index - 1)}
        >
          Previous cast
        </button>
        <label className={styles.castLabel}>
          Outside-window cast{' '}
          <select
            className={styles.control}
            value={index}
            onChange={(event) => setSelectedIndex(Number(event.target.value))}
          >
            {entries.map((cast, castIndex) => (
              <option key={cast.timestamp} value={castIndex}>
                {castIndex + 1} / {entries.length} — {formatTimestamp(cast.timestamp)}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles.control}
          type="button"
          disabled={index === entries.length - 1}
          onClick={() => setSelectedIndex(index + 1)}
        >
          Next cast
        </button>
      </div>
      <p>
        Review Putrefy at <strong>{formatTimestamp(entry.timestamp)}</strong> against Dark
        Transformation's shaded buff window. Outside-window Putrefy casts have a blue outline; the
        selected cast has a white outline. Hover over icons for details and drag horizontally to see
        more. Arrows connect off-global-cooldown casts, including Dark Transformation, to their cast
        times.
      </p>
      {range.end > range.start && (
        <EmbeddedTimeline
          key={entry.timestamp}
          range={range}
          auras={AURAS}
          highlightedCasts={entries.map((cast) => ({
            timestamp: cast.timestamp,
            spellId: TALENTS.PUTREFY_TALENT.id,
            selected: cast.timestamp === entry.timestamp,
            label: `Putrefy at ${formatTimestamp(cast.timestamp)} — ${cast.chargesSpent} ${cast.chargesSpent === 1 ? 'charge' : 'charges'} spent outside Dark Transformation`,
          }))}
        />
      )}
      <div aria-live="polite">
        <p>
          At {formatTimestamp(entry.timestamp)}: {entry.chargesSpent}{' '}
          {entry.chargesSpent === 1 ? 'charge' : 'charges'} spent outside Dark Transformation.
        </p>
        <p>
          Dark Transformation:{' '}
          {entry.darkTransformationCooldownRemaining === 0
            ? 'ready'
            : `ready in ${(entry.darkTransformationCooldownRemaining / 1000).toFixed(1)}s`}
          . Before cast: {entry.chargesBeforeCast}/{entry.maxCharges} Putrefy charges
          {entry.nextChargeRemaining === null
            ? ' (at maximum).'
            : `; next charge in ${(entry.nextChargeRemaining / 1000).toFixed(1)}s.`}
        </p>
      </div>
    </section>
  );
}
