import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { SectionContainer, HelperText } from './GuideDivs';

/** Header section containing title and stats */
const SectionHeader = styled.div`
  display: flex;
  gap: 16px;
  align-items: stretch;
  margin-bottom: 4px;
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
  margin: 0;
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

/** Compact mode: Single line layout with header | stats | content */
const CompactContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

/** Compact mode: Header section (title + subtitle) */
const CompactHeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
`;

/** Compact mode: Title styling (yellow, same as standard) */
const CompactTitle = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: #fab700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

/** Compact mode: Subtitle/label styling (same as standard Label) */
const CompactSubtitle = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

/** Compact mode: Stats section */
const CompactStatsSection = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

/** Compact mode: Content section (bars, charts, etc.) */
const CompactContentSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
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
  /** If true, uses a compact horizontal layout with title on left and stats on right */
  compact?: boolean;
}

/**
 * A reusable wrapper component for guide data visualizations.
 *
 * Provides consistent structure with:
 * - Title and optional subtitle
 * - Optional stat cards in the header
 * - Optional helper text below stats (in header) or below entire header
 * - Main content area
 * - Two layout modes: standard (vertical) and compact (horizontal)
 *
 * Used by IntensityChart, IntensityBar, DonutChart, CastSummary, CastDetail, etc.
 *
 * @param title - Main title for the visualization
 * @param subtitle - Optional subtitle/label (e.g., "Timeline", "Performance")
 * @param stats - Optional stat cards to display in the header
 * @param statsHelperText - Optional helper text to display below the stats in header
 * @param helperText - Optional helper text to display below the header
 * @param children - The main visualization content
 * @param className - Optional CSS class name
 * @param compact - If true, uses horizontal layout (default: false)
 */
export default function GuideDataWrapper({
  title,
  subtitle,
  stats,
  statsHelperText,
  helperText,
  children,
  className,
  compact = false,
}: GuideDataWrapperProps) {
  // Compact layout: Single line with header | stats | content
  if (compact) {
    return (
      <SectionContainer className={className}>
        {helperText && <HelperText style={{ marginBottom: '8px' }}>{helperText}</HelperText>}
        <CompactContainer>
          <CompactHeaderSection>
            <CompactTitle>{title}</CompactTitle>
            {subtitle && <CompactSubtitle>{subtitle}</CompactSubtitle>}
          </CompactHeaderSection>
          {stats && <CompactStatsSection>{stats}</CompactStatsSection>}
          {children && <CompactContentSection>{children}</CompactContentSection>}
        </CompactContainer>
      </SectionContainer>
    );
  }

  // Standard layout: Vertical with title on top, stats on side
  return (
    <SectionContainer className={className}>
      <SectionHeader>
        <TitleColumn>
          <SectionTitle>{title}</SectionTitle>
          {helperText && (
            <HelperText style={{ marginTop: 0, marginBottom: 0 }}>{helperText}</HelperText>
          )}
          {subtitle && <Label style={{ marginTop: '4px' }}>{subtitle}</Label>}
        </TitleColumn>
        {stats && (
          <StatsColumn>
            <StatsRow>{stats}</StatsRow>
            {statsHelperText && <HelperText>{statsHelperText}</HelperText>}
          </StatsColumn>
        )}
      </SectionHeader>

      {children}
    </SectionContainer>
  );
}
