import Spell from 'common/SPELLS/Spell';
import styled from '@emotion/styled';
import { formatDuration } from 'common/format';
import { Tooltip, ControlledExpandable } from 'interface';
import { useFight } from 'interface/report/context/FightContext';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useState } from 'react';
import GradiatedPerformanceBar from './GradiatedPerformanceBar';
import GuideTooltip from './GuideTooltip';
import { BoxRowEntry, PerformanceBoxRow } from './PerformanceBoxRow';
import { StatsRow, StatCard, StatValue, StatLabel, HelperText } from './GuideDivs';
import GuideDataWrapper from './GuideDataWrapper';

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

  const statsContent = (
    <StatsRow>
      {perfect > 0 && (
        <Tooltip content={`Perfect casts - ${perfect} / ${total}`}>
          <StatCard color="#4ec9a2">
            <StatValue>{perfect}</StatValue>
            <StatLabel>Perfect</StatLabel>
          </StatCard>
        </Tooltip>
      )}
      {good > 0 && (
        <Tooltip content={`Good casts - ${good} / ${total}`}>
          <StatCard color="#9ece6a">
            <StatValue>{good}</StatValue>
            <StatLabel>Good</StatLabel>
          </StatCard>
        </Tooltip>
      )}
      {ok > 0 && (
        <Tooltip content={`Ok casts - ${ok} / ${total}`}>
          <StatCard color="#cc7a00">
            <StatValue>{ok}</StatValue>
            <StatLabel>Ok</StatLabel>
          </StatCard>
        </Tooltip>
      )}
      {bad > 0 && (
        <Tooltip content={`Bad casts - ${bad} / ${total}`}>
          <StatCard color="#cd1b1b">
            <StatValue>{bad}</StatValue>
            <StatLabel>Bad</StatLabel>
          </StatCard>
        </Tooltip>
      )}
    </StatsRow>
  );

  return (
    <GuideDataWrapper title={`${spell.name} Casts`} subtitle="Performance" stats={statsContent}>
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
              <PerformanceBoxRow values={castEntries} />
            </BreakdownContainer>
          </ControlledExpandable>
          {!isExpanded && <HelperText>Click the bar above for per-cast breakdown</HelperText>}
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

const BarContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);

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
`;
