import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { SectionContainer, StatsRow, HelperText } from './GuideDivs';
import { iconUrl } from 'interface/Icon';

/** Compact mode: Icon+title area laid out as a 2-col grid so icon spans both rows */
const CompactTitleGroup = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr;
  grid-template-rows: auto auto;
  column-gap: 8px;
  align-items: center;
  min-width: 180px;
`;

/** Icon cell spanning both title and subtitle rows */
const CompactIconCell = styled.div`
  grid-column: 1;
  grid-row: 1 / span 2;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: block;
  }
`;

/** Header: single row with title+subtitle on left, pills on right */
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

/** Bare wrapper — matches SectionContainer spacing without the box styling */
const BareSection = styled.div`
  margin-bottom: 10px;
`;

/** Left side: title + subtitle stacked vertically */
const TitleColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;

/** Main title/header for guide sections */
const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fab700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
`;

/** Inline subtitle badge / label — sits below the title */
const Label = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
`;

/** Right side wrapper for pills + optional helper text */
const StatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-end;
`;

/** Compact mode: Single line layout with header | stats | content */
const CompactContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

/** Compact mode: Header section (title + subtitle stacked) -- used when no icon */
const CompactHeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-width: 180px;
`;

/** Compact mode: same title/subtitle styles as standard layout */
const CompactTitle = SectionTitle;
const CompactSubtitle = Label;

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
  /** Optional icon URL to display before the title in compact mode */
  icon?: string;
  /** The main visualization content */
  children?: ReactNode;
  /** If true, renders without the outer SectionContainer border/background */
  bare?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** If true, uses a compact horizontal layout with title on left and stats on right */
  compact?: boolean;
}

export default function GuideDataWrapper({
  title,
  subtitle,
  stats,
  statsHelperText,
  helperText,
  children,
  className,
  bare = false,
  compact = false,
  icon,
}: GuideDataWrapperProps) {
  const header = (
    <SectionHeader>
      <TitleColumn>
        <SectionTitle>{title}</SectionTitle>
        {subtitle && <Label>{subtitle}</Label>}
      </TitleColumn>
      {stats && (
        <StatsColumn>
          <StatsRow>{stats}</StatsRow>
          {statsHelperText && <HelperText style={{ marginTop: 0 }}>{statsHelperText}</HelperText>}
        </StatsColumn>
      )}
    </SectionHeader>
  );

  // Compact layout: Single line with header | stats | content
  if (compact) {
    const titleBlock = icon ? (
      <CompactTitleGroup>
        <CompactIconCell>
          <img src={iconUrl(icon)} alt="" />
        </CompactIconCell>
        <CompactTitle style={{ gridColumn: 2, gridRow: 1 }}>{title}</CompactTitle>
        {subtitle && (
          <CompactSubtitle style={{ gridColumn: 2, gridRow: 2 }}>{subtitle}</CompactSubtitle>
        )}
      </CompactTitleGroup>
    ) : (
      <CompactHeaderSection>
        <CompactTitle>{title}</CompactTitle>
        {subtitle && <CompactSubtitle>{subtitle}</CompactSubtitle>}
      </CompactHeaderSection>
    );
    const inner = (
      <>
        {helperText}
        <CompactContainer>
          {titleBlock}
          {stats && <StatsRow>{stats}</StatsRow>}
          {children && <CompactContentSection>{children}</CompactContentSection>}
        </CompactContainer>
      </>
    );
    return bare ? (
      <BareSection className={className}>{inner}</BareSection>
    ) : (
      <SectionContainer className={className}>{inner}</SectionContainer>
    );
  }

  // Standard layout
  const inner = (
    <>
      {helperText}
      {header}
      {children}
    </>
  );

  return bare ? (
    <BareSection className={className}>{inner}</BareSection>
  ) : (
    <SectionContainer className={className}>{inner}</SectionContainer>
  );
}
