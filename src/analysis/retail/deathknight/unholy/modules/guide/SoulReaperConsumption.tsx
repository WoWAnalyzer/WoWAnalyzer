import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { PerformanceMark } from 'interface/guide';
import CastDetail, { PerCastData } from 'interface/guide/components/CastDetail';
import { TipBox } from 'interface/guide/components';
import EmbeddedTimeline from 'interface/report/Results/Timeline/EmbeddedTimeline';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

interface Props {
  casts: { timestamp: number; stacksConsumed: number | null }[];
  fightStart: number;
  fightEnd: number;
  formatTimestamp: (timestamp: number) => string;
}

const PERFORMANCES = [
  QualitativePerformance.Perfect,
  QualitativePerformance.Good,
  QualitativePerformance.Fail,
];
const AURAS = [SPELLS.LESSER_GHOUL_BUFF, SPELLS.DARK_TRANSFORMATION_BUFF];

export default function SoulReaperConsumption({
  casts,
  fightStart,
  fightEnd,
  formatTimestamp,
}: Props) {
  if (casts.length === 0) {
    return null;
  }

  const unknownCasts = casts.filter((cast) => cast.stacksConsumed === null);
  const castDetails: PerCastData[] = casts.flatMap((cast) => {
    const stacks = cast.stacksConsumed;
    if (stacks === null) {
      return [];
    }
    const performance =
      stacks === 3
        ? QualitativePerformance.Perfect
        : stacks === 2
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail;
    const range = {
      start: Math.max(fightStart, cast.timestamp - 10000),
      end: Math.min(fightEnd, cast.timestamp + 2000),
    };

    return [
      {
        performance,
        timestamp: formatTimestamp(cast.timestamp),
        tooltip: `Soul Reaper consumed ${stacks} of 3 Lesser Ghoul stacks at ${formatTimestamp(cast.timestamp)}.`,
        stats: [{ value: `${stacks} / 3`, label: 'Lesser Ghoul stacks consumed' }],
        details:
          stacks === 3
            ? 'You consumed all three stacks, getting the full Lesser Ghoul benefit from this cast.'
            : stacks === 2
              ? 'You consumed two stacks. Prepare one more before your next Soul Reaper for additional minion damage.'
              : `You consumed ${stacks === 0 ? 'no stacks' : 'only one stack'}. Prepare three before your next Soul Reaper to get more minion damage from the same cast.`,
        additionalContent:
          stacks < 3 && range.end > range.start
            ? {
                content: (
                  <details>
                    <summary>Review how you prepared this cast</summary>
                    <p>
                      Look for stack builders and Scourge Strike casts before the highlighted Soul
                      Reaper. Prepare the stacks ahead of time; do not lose a Soul Reaper use by
                      waiting for stacks when the target is about to die or Reaping is about to
                      expire.
                    </p>
                    <EmbeddedTimeline
                      range={range}
                      auras={AURAS}
                      highlightedCasts={[
                        {
                          timestamp: cast.timestamp,
                          spellId: TALENTS.SOUL_REAPER_TALENT.id,
                          selected: true,
                          label: `Soul Reaper consumed ${stacks} Lesser Ghoul stacks.`,
                        },
                      ]}
                    />
                  </details>
                ),
              }
            : undefined,
      },
    ];
  });

  return (
    <div style={{ minWidth: 0 }}>
      <TipBox hideIcon>
        <div>
          <PerformanceMark perf={QualitativePerformance.Perfect} /> <strong>Perfect</strong>: 3
          Lesser Ghoul stacks consumed.
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Good} /> <strong>Good</strong>: 2 stacks
          consumed.
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Fail} /> <strong>Bad</strong>: 1 or 0 stacks
          consumed.
        </div>
      </TipBox>
      <p>These grades measure Lesser Ghoul stack preparation.</p>
      {castDetails.length > 0 && (
        <CastDetail
          title="Soul Reaper casts"
          casts={castDetails}
          possiblePerformances={PERFORMANCES}
        />
      )}
      {unknownCasts.length > 0 && (
        <p>
          Consumption could not be established for casts at{' '}
          {unknownCasts.map((cast) => formatTimestamp(cast.timestamp)).join(', ')}. These casts are
          excluded from the grades.
        </p>
      )}
    </div>
  );
}
