import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { iconUrl } from 'interface/Icon';

/** Container for each guide data section */
export const SectionContainer = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
`;

/** Row for stat cards / pills in a section header */
export const StatsRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

/** Small italicized helper text for additional context */
export const HelperText = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
`;

/** Compact mode: Icon+title area laid out as a 2-col grid so icon spans both rows */
const CompactTitleGroup = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 8px;
  align-items: center;
  min-width: 180px;
`;

/** Icon cell spanning both title and subtitle rows */
const CompactIconCell = styled.div`
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
  margin-top: 4px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

/** Bare wrapper — matches SectionContainer spacing without the box styling */
const BareSection = styled.div`
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
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

/** Stat card with colored border/value — used in CastOverview and CastDetail */
export const StatCard = styled.div<{ color: string }>`
  display: flex;
  align-items: stretch;
  border: 1px solid ${(props) => props.color}45;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-height: 44px;
`;

export const StatCardValue = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.color};

  img {
    width: auto;
    height: 100%;
    border-radius: 3px;
  }

  &:has(img) {
    padding: 6px;
  }
`;

export const StatCardDivider = styled.div<{ color: string }>`
  width: 1px;
  height: 55%;
  align-self: center;
  background: ${(props) => props.color}35;
  flex-shrink: 0;
`;

export const StatCardLabel = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  line-height: 1.2;
  flex: 1;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 6px;
`;

/** Performance summary badge grid — 4 columns, one per perf level */
export const PerfBadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
`;

export const PerfBadgeCount = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(p) => p.color};
  flex-shrink: 0;
`;

export const PerfBadgeDivider = styled.div<{ color: string }>`
  width: 1px;
  height: 55%;
  align-self: center;
  background: ${(p) => p.color}40;
  flex-shrink: 0;
`;

export const PerfBadgeLabel = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  flex: 1;
`;

/** Row pairing helper text with an inline element (e.g. a nav counter) */
export const HelperTextRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

/** Performance filter toggle — stat-card style, clickable; greyed-out when disabled */
export const FilterBadge = styled.div<{ color: string; active: boolean; disabled?: boolean }>`
  display: flex;
  align-items: stretch;
  border: 1px solid
    ${(props) =>
      props.disabled
        ? 'rgba(255,255,255,0.1)'
        : props.active
          ? props.color + '60'
          : 'rgba(255,255,255,0.08)'};
  border-radius: 4px;
  background: ${(props) =>
    props.disabled
      ? 'rgba(255,255,255,0.04)'
      : props.active
        ? props.color + '08'
        : 'rgba(0,0,0,0.2)'};
  overflow: hidden;
  min-height: 30px;
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
  pointer-events: ${(props) => (props.disabled ? 'none' : undefined)};
  opacity: ${(props) => (props.disabled || !props.active ? 0.4 : 1)};
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    opacity: 1;
    border-color: ${(props) => props.color + '70'};
    background: ${(props) => props.color + '20'};
  }
`;

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
