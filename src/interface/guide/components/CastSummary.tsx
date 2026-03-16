import Spell from 'common/SPELLS/Spell';
import { formatDuration } from 'common/format';
import { ControlledExpandable } from 'interface';
import { useFight } from 'interface/report/context/FightContext';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useState, type CSSProperties, type JSX } from 'react';
import GradiatedPerformanceBar from './GradiatedPerformanceBar';
import GuideTooltip from './GuideTooltip';
import { BoxRowEntry, PerformanceBoxRow } from './PerformanceBoxRow';
import { qualitativePerformanceToColor } from 'interface/guide';
import GuideDataWrapper, {
  FilterBadge,
  HelperText,
  PerfBadgeGrid,
  PerfBadgeCount,
  PerfBadgeDivider,
  PerfBadgeLabel,
} from './GuideDataWrapper';
import styles from './CastSummary.module.scss';

/** Represents a single cast evaluation with timestamp and performance assessment */
export interface CastEvaluation {
  /** Timestamp when the spell was cast (in milliseconds) */
  timestamp: number;
  /** Performance rating for this cast (Perfect, Good, Ok, Fail) */
  performance: QualitativePerformance;
  /** Human-readable explanation of why this performance rating was given */
  reason: string;
}

interface CastSummaryProps {
  /** The spell being analyzed */
  spell: Spell;
  /** Array of cast evaluations to display */
  casts: CastEvaluation[];
  /** Whether to show expandable per-cast breakdown. Default: false */
  showBreakdown?: boolean;
}

/** Performance level definitions — order determines display order in the badge grid */
const PERF_LEVELS = [
  { perf: QualitativePerformance.Perfect, label: 'Perfect' },
  { perf: QualitativePerformance.Good, label: 'Good' },
  { perf: QualitativePerformance.Ok, label: 'Ok' },
  { perf: QualitativePerformance.Fail, label: 'Bad' },
] as const;

/**
 * Displays cast performance summary bar and optionally detailed per-cast breakdown.
 * Shows a "no casts" message if the casts array is empty.
 *
 * @param spell - The spell being analyzed
 * @param casts - Array of cast evaluations with timestamps and performance ratings
 * @param showBreakdown - Whether to show expandable per-cast breakdown (default: false)
 */
export default function CastSummary({
  spell,
  casts,
  showBreakdown = false,
}: CastSummaryProps): JSX.Element {
  const { fight } = useFight();
  const formatTimestamp = (timestamp: number) => formatDuration(timestamp - fight.start_time);
  const [isExpanded, setIsExpanded] = useState(false);

  // Show "no casts" message if there are no casts
  if (!casts || casts.length === 0) {
    return (
      <div>
        <strong>No {spell.name} casts recorded.</strong>
        <br />
        <small>
          Make sure you are using this spell if it is available to you and you are specced into it.
        </small>
      </div>
    );
  }

  // Calculate performance counts
  const perfect = casts.filter((c) => c.performance === QualitativePerformance.Perfect).length;
  const good = casts.filter((c) => c.performance === QualitativePerformance.Good).length;
  const ok = casts.filter((c) => c.performance === QualitativePerformance.Ok).length;
  const bad = casts.filter((c) => c.performance === QualitativePerformance.Fail).length;
  const total = casts.length;
  // Same scaling as CastDetail timeline: min width = 1/5 (≤5 casts), max 20 per row
  const rectWidthPct = Math.max(100 / Math.max(total, 5), 100 / 20);
  const boxRowScalerStyle = {
    '--box-row-width-pct': `${rectWidthPct}%`,
  } as CSSProperties;

  // Convert to BoxRowEntry format for breakdown
  const castEntries: BoxRowEntry[] = showBreakdown
    ? casts.map((cast) => ({
        value: cast.performance,
        tooltip: (
          <GuideTooltip
            formatTimestamp={formatTimestamp}
            performance={cast.performance}
            tooltipItems={[{ perf: cast.performance, detail: cast.reason }]}
            timestamp={cast.timestamp}
          />
        ),
      }))
    : [];

  const perfCounts: Record<QualitativePerformance, number> = {
    [QualitativePerformance.Perfect]: perfect,
    [QualitativePerformance.Good]: good,
    [QualitativePerformance.Ok]: ok,
    [QualitativePerformance.Fail]: bad,
  };

  const statsContent = (
    <PerfBadgeGrid>
      {PERF_LEVELS.map(({ perf, label }) => {
        const count = perfCounts[perf];
        const color = qualitativePerformanceToColor(perf);
        const inactive = count === 0;
        return (
          <FilterBadge
            key={label}
            color={inactive ? '#c8c8c8' : color}
            active={!inactive}
            style={{ pointerEvents: 'none', cursor: 'default' }}
          >
            <PerfBadgeCount color={inactive ? '#c8c8c8' : color}>{count}</PerfBadgeCount>
            <PerfBadgeDivider color={inactive ? '#c8c8c8' : color} />
            <PerfBadgeLabel>{label}</PerfBadgeLabel>
          </FilterBadge>
        );
      })}
    </PerfBadgeGrid>
  );

  return (
    <GuideDataWrapper
      bare
      title={`${spell.name} Casts`}
      subtitle="Performance"
      stats={statsContent}
    >
      {showBreakdown ? (
        <>
          <ControlledExpandable
            header={
              <div className={styles.barContainer}>
                <GradiatedPerformanceBar
                  perfect={{ count: perfect, label: 'Perfect casts' }}
                  good={{ count: good, label: 'Good casts' }}
                  ok={{ count: ok, label: 'Ok casts' }}
                  bad={{ count: bad, label: 'Bad casts' }}
                />
              </div>
            }
            element="section"
            expanded={isExpanded}
            inverseExpanded={() => setIsExpanded(!isExpanded)}
          >
            <div className={styles.breakdownContainer}>
              <HelperText>Hover over the boxes below for more details</HelperText>
              <div className={styles.boxRowScaler} style={boxRowScalerStyle}>
                <PerformanceBoxRow values={castEntries} />
              </div>
            </div>
          </ControlledExpandable>
          <HelperText
            className={styles.disappearingHelperText}
            style={{ height: isExpanded ? 0 : '1lh' }}
          >
            Click the bar above for per-cast breakdown
          </HelperText>
        </>
      ) : (
        <div className={styles.barContainer}>
          <GradiatedPerformanceBar
            perfect={{ count: perfect, label: 'Perfect casts' }}
            good={{ count: good, label: 'Good casts' }}
            ok={{ count: ok, label: 'Ok casts' }}
            bad={{ count: bad, label: 'Bad casts' }}
          />
        </div>
      )}
    </GuideDataWrapper>
  );
}
