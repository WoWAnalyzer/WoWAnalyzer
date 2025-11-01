import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { SectionContainer, HelperText, HelperTextRow } from './GuideDivs';

/** Header section containing title and stats */
const SectionHeader = styled.div`
  display: flex;
  gap: 16px;
  align-items: stretch;
  margin-bottom: 8px;
`;

/** Column for title and labels */
const TitleColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: space-between;
`;

/** Main title/header for guide sections */
const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #fab700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

/** Small label text (e.g., "Timeline", "Performance") */
const Label = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

/** Row for stat cards */
const StatsRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

/** Column container for stats and optional helper text */
const StatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
`;

interface GuideDataWrapperProps {
  /** Main title for the visualization */
  title: string | ReactNode;
  /** Optional subtitle/label (e.g., "Timeline", "Performance", "Distribution") */
  subtitle?: string;
  /** Optional stat cards to display in the header */
  stats?: ReactNode;
  /** Optional helper text to display below the stats in the header */
  statsHelperText?: string | ReactNode;
  /** Optional helper text to display below the header */
  helperText?: string | ReactNode;
  /** The main visualization content */
  children?: ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * A reusable wrapper component for guide data visualizations.
 *
 * Provides consistent structure with:
 * - Title and optional subtitle
 * - Optional stat cards in the header
 * - Optional helper text below stats (in header) or below entire header
 * - Main content area
 *
 * Used by IntensityChart, IntensityBar, DonutChart, CastSummary, CastDetail, etc.
 */
export default function GuideDataWrapper({
  title,
  subtitle,
  stats,
  statsHelperText,
  helperText,
  children,
  className,
}: GuideDataWrapperProps) {
  return (
    <SectionContainer className={className}>
      <SectionHeader>
        <TitleColumn>
          <SectionTitle>{title}</SectionTitle>
          {subtitle && <Label>{subtitle}</Label>}
        </TitleColumn>
        {stats && (
          <StatsColumn>
            <StatsRow>{stats}</StatsRow>
            {statsHelperText && <HelperText>{statsHelperText}</HelperText>}
          </StatsColumn>
        )}
      </SectionHeader>

      {helperText && (
        <HelperTextRow>
          <HelperText>{helperText}</HelperText>
        </HelperTextRow>
      )}

      {children}
    </SectionContainer>
  );
}
