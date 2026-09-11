import DK_SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { PerformanceMark } from 'interface/guide';
import { TipBox } from 'interface/guide/components';
import CastDetail, { PerCastData } from 'interface/guide/components/CastDetail';
import EmbeddedTimeline from 'interface/report/Results/Timeline/EmbeddedTimeline';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export interface PutrefyCastEntry {
  timestamp: number;
  duringDarkTransformation: boolean;
  duringForbiddenKnowledge: boolean;
  chargesSpent: number;
  chargesBeforeCast: number;
  maxCharges: number;
  darkTransformationCooldownRemaining: number;
  nextChargeRemaining: number | null;
  performance: QualitativePerformance;
  reason: string;
}

interface Props {
  entries: PutrefyCastEntry[];
  fightStart: number;
  fightEnd: number;
  formatTimestamp: (timestamp: number) => string;
  hasDarkTransformation: boolean;
}

const AURAS = [DK_SPELLS.DARK_TRANSFORMATION_BUFF, DK_SPELLS.FORBIDDEN_KNOWLEDGE_BUFF];
const PERFORMANCES = [
  QualitativePerformance.Perfect,
  QualitativePerformance.Good,
  QualitativePerformance.Fail,
];

export default function PutrefyTimeline({
  entries,
  fightStart,
  fightEnd,
  formatTimestamp,
  hasDarkTransformation,
}: Props) {
  const casts: PerCastData[] = entries.map((entry) => {
    const range = {
      start: Math.max(fightStart, entry.timestamp - 10000),
      end: Math.min(
        fightEnd,
        entry.timestamp + Math.max(15000, entry.darkTransformationCooldownRemaining + 5000),
      ),
    };
    return {
      performance: entry.performance,
      timestamp: formatTimestamp(entry.timestamp),
      tooltip: entry.reason,
      stats: [
        { value: entry.chargesSpent, label: 'Charges spent', ungraded: true },
        {
          value: `${entry.chargesBeforeCast}/${entry.maxCharges}`,
          label: 'Charges before cast',
          ungraded: true,
        },
        {
          value: !hasDarkTransformation
            ? 'Not talented'
            : entry.duringDarkTransformation
              ? 'Active'
              : entry.darkTransformationCooldownRemaining === 0
                ? 'Available'
                : 'On cooldown',
          label: 'Dark Transformation',
          ungraded: true,
        },
      ],
      details: entry.reason,
      additionalContent: {
        content: (
          <>
            {hasDarkTransformation &&
              !entry.duringDarkTransformation &&
              entry.darkTransformationCooldownRemaining > 0 && (
                <p>
                  Dark Transformation had{' '}
                  {(entry.darkTransformationCooldownRemaining / 1000).toFixed(1)}s remaining on its
                  cooldown.
                </p>
              )}
            <p>
              {entry.nextChargeRemaining === null
                ? 'Putrefy was at maximum charges before this cast.'
                : `The next Putrefy charge was expected in ${(entry.nextChargeRemaining / 1000).toFixed(1)}s.`}
            </p>
            {range.end > range.start && (
              <details>
                <summary>Review this cast in the timeline</summary>
                <p>
                  The selected Putrefy cast has a white outline. Shaded areas show active buffs.
                  Hover over icons for details and drag horizontally to see more. Arrows mark
                  off-global-cooldown casts.
                </p>
                <EmbeddedTimeline
                  key={entry.timestamp}
                  range={range}
                  auras={AURAS}
                  highlightedCasts={[
                    {
                      timestamp: entry.timestamp,
                      spellId: TALENTS.PUTREFY_TALENT.id,
                      selected: true,
                      label: entry.reason,
                    },
                  ]}
                />
              </details>
            )}
          </>
        ),
      },
    };
  });

  return (
    <div style={{ minWidth: 0 }}>
      <TipBox hideIcon>
        {hasDarkTransformation && (
          <div>
            <PerformanceMark perf={QualitativePerformance.Perfect} /> <strong>Perfect</strong>:
            during Dark Transformation.
          </div>
        )}
        <div>
          <PerformanceMark perf={QualitativePerformance.Good} /> <strong>Good</strong>: an
          applicable exception explains the timing
          {!hasDarkTransformation && ', or DT is not talented'}.
        </div>
        {hasDarkTransformation && (
          <div>
            <PerformanceMark perf={QualitativePerformance.Fail} /> <strong>Bad</strong>: outside DT
            with no observed exception.
          </div>
        )}
      </TipBox>
      <CastDetail
        title="Putrefy casts"
        casts={casts}
        possiblePerformances={hasDarkTransformation ? PERFORMANCES : [QualitativePerformance.Good]}
      />
    </div>
  );
}
