import { Tooltip } from 'interface';
import { qualitativePerformanceToColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useState, useCallback } from 'react';
import {
  CastDetail,
  GuideDataWrapper,
  HelperText,
  HelperTextRow,
  PerCastData,
  StatCard,
  StatCardDivider,
  StatCardLabel,
  StatCardValue,
  StatsGrid,
} from 'interface/guide/components';
import cssComponent from 'interface/utils/css-component';
import styles from './DisintegrateWindowAnalysis.module.scss';
import { AdditionalContent } from 'interface/guide/components/CastDetail';

export interface CastWindow {
  name: string;

  start: string;

  end: string;

  /** Array of per-cast data to display */
  casts: PerCastData[];

  stats: PerWindowStat[];

  additionalContent: AdditionalContent[];

  performance: QualitativePerformance;
}
export interface PerWindowStat {
  /** The stat value to display — string or any ReactNode (e.g. a SpellIcon) */
  value: React.ReactNode;
  /** Label describing what this stat represents */
  label: string;
  /** Detailed tooltip content for this stat */
  tooltip?: React.ReactNode | null;
  /** Optional performance rating for color-coding this specific stat */
  performance?: QualitativePerformance;
  /**
   * When true, render with a neutral gray instead of grading or inheriting the cast color.
   * Prefer this over omitting `performance` when the stat is informational only.
   */
  ungraded?: boolean;
}

interface DisintegrateWindowProps {
  /** Title for the cast detail section */
  title: string;
  /** Array of per-cast data to display */
  windows: CastWindow[];
  /** Optional description text shown below the title */
  description?: string;
}

/** Color for informational stats that are not graded (`performance: null`) */
const NEUTRAL_STAT_COLOR = '#c8c8c8';

export function DisintegrateWindowAnalysis({
  title,
  windows,
  description,
}: DisintegrateWindowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalWindows = windows.length;
  const validIndex = Math.min(currentIndex, Math.max(0, totalWindows - 1));
  const currentWindow = totalWindows > 0 ? windows[validIndex] : null;
  const originalIndex = currentWindow ? windows.indexOf(currentWindow) : -1;

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalWindows - 1));
  }, [totalWindows]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalWindows - 1 ? prev + 1 : 0));
  }, [totalWindows]);

  const headerDescription = description ? (
    <HelperTextRow>
      <HelperText>{description}</HelperText>
    </HelperTextRow>
  ) : undefined;

  return (
    <GuideDataWrapper bare title={title} helperText={headerDescription}>
      {currentWindow!.casts.length === 0 ? (
        <NoResultsMessage>
          <NoResultsTitle>No casts found.</NoResultsTitle>
        </NoResultsMessage>
      ) : (
        <WindowContainer>
          <WindowHeader>
            <HeaderNavBtn onClick={handlePrevious} disabled={validIndex === 0}>
              <span className="nav-chevron">&#8249;</span>
              <span className="nav-divider" />
              <span className="nav-label">Prev</span>
            </HeaderNavBtn>
            <WindowMeta>
              <WindowLabel>
                {currentWindow!.name} {originalIndex + 1} / {totalWindows} · {currentWindow!.start}{' '}
                - {currentWindow!.end}
              </WindowLabel>
            </WindowMeta>
            <HeaderNavBtn onClick={handleNext} disabled={validIndex === totalWindows - 1}>
              <span className="nav-label">Next</span>
              <span className="nav-divider" />
              <span className="nav-chevron">&#8250;</span>
            </HeaderNavBtn>
            <AccentBar color={qualitativePerformanceToColor(currentWindow!.performance)} />
          </WindowHeader>
          {currentWindow!.stats.length > 0 && (
            <StatsGrid style={{ marginBottom: '10px' }}>
              {currentWindow!.stats.map((stat, statIdx) => {
                const statColor = stat.ungraded
                  ? NEUTRAL_STAT_COLOR
                  : stat.performance
                    ? qualitativePerformanceToColor(stat.performance)
                    : 'rgba(255,255,255,0.3)';
                return (
                  <Tooltip key={statIdx} content={stat.tooltip}>
                    <StatCard color={statColor}>
                      <StatCardValue color={statColor}>{stat.value}</StatCardValue>
                      <StatCardDivider color={statColor} />
                      <StatCardLabel>{stat.label}</StatCardLabel>
                    </StatCard>
                  </Tooltip>
                );
              })}
            </StatsGrid>
          )}
          {currentWindow!.additionalContent.length > 0 && (
            <>
              {currentWindow!.additionalContent.map((aC) => {
                return (
                  <AdditionalContentContainer>
                    {aC!.title && <AdditionalContentHeading>{aC.title}</AdditionalContentHeading>}
                    {aC.content}
                  </AdditionalContentContainer>
                );
              })}
            </>
          )}
          <CastDetail casts={currentWindow!.casts} title="Single Cast Analysis" />
        </WindowContainer>
      )}
    </GuideDataWrapper>
  );
}

const WindowContainer = cssComponent('div', styles.WindowContainer, [] as const);

const WindowHeader = cssComponent('div', styles.WindowHeader, [] as const);

const WindowMeta = cssComponent('div', styles.WindowMeta, [] as const);

const WindowLabel = cssComponent('span', styles.WindowLabel, [] as const);

/** Bottom gradient accent bar in the card's performance color */
const AccentBar = cssComponent('div', styles.AccentBar, ['color'] as const);

/** Stat-card-style nav button: chevron + divider + label */
const HeaderNavBtn = cssComponent('button', styles.HeaderNavBtn, [] as const);

const NoResultsMessage = cssComponent('div', styles.NoResultsMessage, [] as const);

const NoResultsTitle = cssComponent('div', styles.NoResultsTitle, [] as const);

const AdditionalContentContainer = cssComponent(
  'div',
  styles.AdditionalContentContainer,
  [] as const,
);

const AdditionalContentHeading = cssComponent('div', styles.AdditionalContentHeading, [] as const);
