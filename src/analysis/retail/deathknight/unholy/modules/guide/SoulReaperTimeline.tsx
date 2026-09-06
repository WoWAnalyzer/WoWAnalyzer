import SPELLS from 'common/SPELLS';
import EmbeddedTimeline from 'interface/report/Results/Timeline/EmbeddedTimeline';
import { useState } from 'react';
import styles from './CastReview.module.scss';

export interface MissedFreeSoulReaperRecord {
  timestamp: number;
  endTimestamp: number;
  endedAtFightEnd: boolean;
  darkTransformationWindowId: number;
}

interface Props {
  missedWindows: MissedFreeSoulReaperRecord[];
  fightStart: number;
  fightEnd: number;
  formatTimestamp: (timestamp: number) => string;
}

const AURAS = [SPELLS.DARK_TRANSFORMATION_BUFF];

export default function SoulReaperTimeline({
  missedWindows,
  fightStart,
  fightEnd,
  formatTimestamp,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const index = Math.min(selectedIndex, missedWindows.length - 1);
  const window = missedWindows[index];
  if (!window) {
    return null;
  }

  const range = {
    start: Math.max(fightStart, window.timestamp - 2000),
    end: Math.min(fightEnd, window.endTimestamp + 2000),
  };

  return (
    <section className={styles.review} aria-label="Unused Reaping opportunities">
      <h4>Use Soul Reaper before Reaping expires</h4>
      <p>
        {missedWindows.length} Dark Transformation{' '}
        {missedWindows.length === 1 ? 'window had' : 'windows had'} no Soul Reaper cast. Reaping
        made a cast available even above 35% target health.
      </p>
      <div className={styles.navigation}>
        <button
          className={styles.control}
          type="button"
          disabled={index === 0}
          onClick={() => setSelectedIndex(index - 1)}
        >
          Previous window
        </button>
        <label className={styles.castLabel}>
          Unused Reaping window
          <select
            className={styles.control}
            value={index}
            onChange={(event) => setSelectedIndex(Number(event.target.value))}
          >
            {missedWindows.map((item, itemIndex) => (
              <option key={item.darkTransformationWindowId} value={itemIndex}>
                {itemIndex + 1} / {missedWindows.length}: {formatTimestamp(item.timestamp)}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles.control}
          type="button"
          disabled={index === missedWindows.length - 1}
          onClick={() => setSelectedIndex(index + 1)}
        >
          Next window
        </button>
      </div>
      <div aria-live="polite">
        <p>
          <strong>What happened:</strong> Dark Transformation was active from{' '}
          {formatTimestamp(window.timestamp)} to {formatTimestamp(window.endTimestamp)}, but you did
          not cast Soul Reaper during that window.
        </p>
        <p>
          <strong>Next time:</strong>{' '}
          {window.endedAtFightEnd
            ? 'If a target is still attackable, use Soul Reaper before the fight ends instead of saving it for later in Dark Transformation.'
            : 'Use Soul Reaper before Dark Transformation ends so you do not lose the cast granted by Reaping. Use it earlier if the target will soon become unavailable.'}
        </p>
        <p>
          {window.endedAtFightEnd
            ? 'This window was cut short by the end of the fight, so the missing cast may not have been avoidable.'
            : 'Target downtime may explain the missing cast. This is an opportunity to review, not an automatic mistake.'}
        </p>
      </div>
      <details>
        <summary>Review casts during this window</summary>
        <p>
          The shaded area shows when Reaping allowed Soul Reaper. Hover over casts for details and
          drag horizontally to see more.
        </p>
        {range.end > range.start && (
          <EmbeddedTimeline key={window.darkTransformationWindowId} range={range} auras={AURAS} />
        )}
      </details>
    </section>
  );
}
