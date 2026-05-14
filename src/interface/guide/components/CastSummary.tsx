import Spell from 'common/SPELLS/Spell';
import styled from '@emotion/styled';
import { formatDuration } from 'common/format';
import { ControlledExpandable } from 'interface';
import { useFight } from 'interface/report/context/FightContext';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useState, type JSX } from 'react';
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
  /** Whether the breakdown should start expanded. Default: false */
  startExpanded?: boolean;
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
  startExpanded = false,
}: CastSummaryProps): JSX.Element {
  const { fight } = useFight();
  const formatTimestamp = (timestamp: number) => formatDuration(timestamp - fight.start_time);
  const [isExpanded, setIsExpanded] = useState(startExpanded);

  // Show "no casts" message if there are no casts
  if (!casts || casts.length === 0) {
    return (
      <div>
        <strong>No {spell.name} casts recorded.</strong>
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
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
              <BarContainer>
                <GradiatedPerformanceBar
                  perfect={{ count: perfect, label: 'Perfect casts' }}
                  good={{ count: good, label: 'Good casts' }}
                  ok={{ count: ok, label: 'Ok casts' }}
                  bad={{ count: bad, label: 'Bad casts' }}
                />
              </BarContainer>
            }
            element="section"
            expanded={isExpanded}
            inverseExpanded={() => setIsExpanded(!isExpanded)}
          >
            <BreakdownContainer>
              <HelperText>Hover over the boxes below for more details</HelperText>
              <BoxRowScaler widthPct={rectWidthPct}>
                <PerformanceBoxRow values={castEntries} />
              </BoxRowScaler>
            </BreakdownContainer>
          </ControlledExpandable>
          <DisappearingHelperText style={{ height: isExpanded ? 0 : '1lh' }}>
            Click the bar above for per-cast breakdown
          </DisappearingHelperText>
        </>
      ) : (
        <BarContainer>
          <GradiatedPerformanceBar
            perfect={{ count: perfect, label: 'Perfect casts' }}
            good={{ count: good, label: 'Good casts' }}
            ok={{ count: ok, label: 'Ok casts' }}
            bad={{ count: bad, label: 'Bad casts' }}
          />
        </BarContainer>
      )}
    </GuideDataWrapper>
  );
}

const DisappearingHelperText = styled(HelperText)`
  margin-top: 4px;
  overflow-y: clip;
  transition: height 0.5s; /* 0.5s matches react-animate-height */
`;

const BarContainer = styled.div`
  border-radius: 4px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.07);

  .gradiated-bar-container {
    display: flex;
  }

  .gradiated-bar-container > div {
    height: 24px !important;
    display: block !important;
  }
`;

const BreakdownContainer = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.07);
`;

/** Overrides PerformanceBoxRow's auto-fill grid to match the CastDetail timeline scaling */
const BoxRowScaler = styled.div<{ widthPct: number }>`
  .performance-block-row {
    grid-template-columns: repeat(auto-fill, calc(${(p) => p.widthPct}% - 3px));
    gap: 3px;
  }
  .performance-block {
    height: 16px !important;
    border-radius: 2px;
  }
`;
