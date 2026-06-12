import { JSX, ReactNode } from 'react';
import cssComponent from 'interface/utils/css-component';
import styles from './GuideDataWrapper.module.scss';
import { iconUrl } from 'interface/Icon';
import clsx from 'clsx';

/** Container for each guide data section */
export const SectionContainer = cssComponent('div', styles.SectionContainer, [] as const);

/** Row for stat cards / pills in a section header */
export const StatsRow = cssComponent('div', styles.StatsRow, [] as const);

/** Small italicized helper text for additional context */
export const HelperText = cssComponent('div', styles.HelperText, [] as const);

/** Compact mode: Icon+title area laid out as a 2-col grid so icon spans both rows */
const CompactTitleGroup = cssComponent('div', styles.CompactTitleGroup, [] as const);

/** Icon cell spanning both title and subtitle rows */
const CompactIconCell = cssComponent('div', styles.CompactIconCell, [] as const);

/** Header: single row with title+subtitle on left, pills on right */
const SectionHeader = cssComponent('div', styles.SectionHeader, [] as const);

/** Bare wrapper — matches SectionContainer spacing without the box styling */
const BareSection = cssComponent('div', styles.BareSection, [] as const);

/** Left side: title + subtitle stacked vertically */
const TitleColumn = cssComponent('div', styles.TitleColumn, [] as const);

/** Main title/header for guide sections */
const SectionTitle = cssComponent('h3', styles.SectionTitle, [] as const);

/** Inline subtitle badge / label — sits below the title */
const Label = cssComponent('div', styles.Label, [] as const);

/** Right side wrapper for pills + optional helper text */
const StatsColumn = cssComponent('div', styles.StatsColumn, [] as const);

/** Compact mode: Single line layout with header | stats | content */
const CompactContainer = cssComponent('div', styles.CompactContainer, [] as const);

/** Compact mode: Header section (title + subtitle stacked) -- used when no icon */
const CompactHeaderSection = cssComponent('div', styles.CompactHeaderSection, [] as const);

/** Compact mode: same title/subtitle styles as standard layout */
const CompactTitle = SectionTitle;
const CompactSubtitle = Label;

/** Compact mode: Content section (bars, charts, etc.) */
const CompactContentSection = cssComponent('div', styles.CompactContentSection, [] as const);

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
export const StatCard = cssComponent('div', styles.StatCard, ['color'] as const);

export const StatCardValue = cssComponent('div', styles.StatCardValue, ['color'] as const);

export const StatCardDivider = cssComponent('div', styles.StatCardDivider, ['color'] as const);

export const StatCardLabel = cssComponent('div', styles.StatCardLabel, [] as const);

export const StatsGrid = cssComponent('div', styles.StatsGrid, [] as const);

/** Performance summary badge grid — 4 columns, one per perf level */
export const PerfBadgeGrid = cssComponent('div', styles.PerfBadgeGrid, [] as const);

export const PerfBadgeCount = cssComponent('div', styles.PerfBadgeCount, ['color'] as const);

export const PerfBadgeDivider = cssComponent('div', styles.PerfBadgeDivider, ['color'] as const);

export const PerfBadgeLabel = cssComponent('div', styles.PerfBadgeLabel, [] as const);

/** Row pairing helper text with an inline element (e.g. a nav counter) */
export const HelperTextRow = cssComponent('div', styles.HelperTextRow, [] as const);

/** Performance filter toggle — stat-card style, clickable; greyed-out when disabled */
export const FilterBadge = ({
  disabled,
  active,
  color,
  children,
  className,
  style,
  innerRef,
  ...rest
}: {
  disabled?: boolean;
  active?: boolean;
  color: string;
  innerRef?: React.Ref<HTMLDivElement>;
} & React.ComponentProps<'div'>): JSX.Element => (
  <div
    ref={innerRef}
    {...rest}
    className={clsx(
      styles.FilterBadge,
      {
        [styles.disabled]: disabled,
        [styles.active]: active,
      },
      className,
    )}
    style={{ ...style, '--color': color }}
  >
    {children}
  </div>
);

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
