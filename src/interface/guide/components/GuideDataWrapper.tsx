import { clsx } from 'clsx';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { iconUrl } from 'interface/Icon';
import styles from './GuideDataWrapper.module.scss';

/** Container for each guide data section */
export const SectionContainer = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.sectionContainer, className)} />
);

/** Row for stat cards / pills in a section header */
export const StatsRow = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.statsRow, className)} />
);

/** Small italicized helper text for additional context */
export const HelperText = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.helperText, className)} />
);

/** Compact mode: Icon+title area laid out as a 2-col grid so icon spans both rows */
const CompactTitleGroup = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.compactTitleGroup, className)} />
);

/** Icon cell spanning both title and subtitle rows */
const CompactIconCell = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.compactIconCell, className)} />
);

/** Header: single row with title+subtitle on left, pills on right */
const SectionHeader = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.sectionHeader, className)} />
);

/** Bare wrapper — matches SectionContainer spacing without the box styling */
const BareSection = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.bareSection, className)} />
);

/** Left side: title + subtitle stacked vertically */
const TitleColumn = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.titleColumn, className)} />
);

/** Main title/header for guide sections */
const SectionTitle = ({ className, ...props }: ComponentPropsWithoutRef<'h3'>) => (
  <h3 {...props} className={clsx(styles.sectionTitle, className)} />
);

/** Inline subtitle badge / label — sits below the title */
const Label = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.label, className)} />
);

/** Right side wrapper for pills + optional helper text */
const StatsColumn = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.statsColumn, className)} />
);

/** Compact mode: Single line layout with header | stats | content */
const CompactContainer = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.compactContainer, className)} />
);

/** Compact mode: Header section (title + subtitle stacked) -- used when no icon */
const CompactHeaderSection = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.compactHeaderSection, className)} />
);

/** Compact mode: same title/subtitle styles as standard layout */
const CompactTitle = SectionTitle;
const CompactSubtitle = Label;

/** Compact mode: Content section (bars, charts, etc.) */
const CompactContentSection = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.compactContentSection, className)} />
);

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
interface ColorProps {
  color: string;
}

type FilterBadgeProps = ComponentPropsWithoutRef<'div'> & {
  color: string;
  active: boolean;
  disabled?: boolean;
};

type CSSVariableStyle = CSSProperties & Record<`--${string}`, string | number | undefined>;

const withVariables = (style: CSSProperties | undefined, variables: CSSVariableStyle) =>
  ({ ...variables, ...style }) as CSSProperties;

export const StatCard = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'> & ColorProps>(
  ({ color, className, style, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={clsx(styles.statCard, className)}
      style={withVariables(style, {
        '--guide-border-color': `${color}45`,
      })}
    />
  ),
);

export const StatCardValue = ({
  color,
  className,
  style,
  ...props
}: ComponentPropsWithoutRef<'div'> & ColorProps) => (
  <div
    {...props}
    className={clsx(styles.statCardValue, className)}
    style={withVariables(style, {
      '--guide-color': color,
    })}
  />
);

export const StatCardDivider = ({
  color,
  className,
  style,
  ...props
}: ComponentPropsWithoutRef<'div'> & ColorProps) => (
  <div
    {...props}
    className={clsx(styles.statCardDivider, className)}
    style={withVariables(style, {
      '--guide-divider-color': `${color}35`,
    })}
  />
);

export const StatCardLabel = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.statCardLabel, className)} />
);

export const StatsGrid = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.statsGrid, className)} />
);

/** Performance summary badge grid — 4 columns, one per perf level */
export const PerfBadgeGrid = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.perfBadgeGrid, className)} />
);

export const PerfBadgeCount = ({
  color,
  className,
  style,
  ...props
}: ComponentPropsWithoutRef<'div'> & ColorProps) => (
  <div
    {...props}
    className={clsx(styles.perfBadgeCount, className)}
    style={withVariables(style, {
      '--guide-color': color,
    })}
  />
);

export const PerfBadgeDivider = ({
  color,
  className,
  style,
  ...props
}: ComponentPropsWithoutRef<'div'> & ColorProps) => (
  <div
    {...props}
    className={clsx(styles.perfBadgeDivider, className)}
    style={withVariables(style, {
      '--guide-divider-color': `${color}40`,
    })}
  />
);

export const PerfBadgeLabel = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.perfBadgeLabel, className)} />
);

/** Row pairing helper text with an inline element (e.g. a nav counter) */
export const HelperTextRow = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.helperTextRow, className)} />
);

/** Performance filter toggle — stat-card style, clickable; greyed-out when disabled */
export const FilterBadge = forwardRef<HTMLDivElement, FilterBadgeProps>(
  ({ color, active, disabled, className, style, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={clsx(styles.filterBadge, disabled && styles.filterBadgeDisabled, className)}
      style={withVariables(style, {
        '--guide-background-color': disabled
          ? 'rgba(255,255,255,0.04)'
          : active
            ? `${color}08`
            : 'rgba(0,0,0,0.2)',
        '--guide-border-color': disabled
          ? 'rgba(255,255,255,0.1)'
          : active
            ? `${color}60`
            : 'rgba(255,255,255,0.08)',
        '--guide-cursor': disabled ? 'default' : 'pointer',
        '--guide-hover-background-color': `${color}20`,
        '--guide-hover-border-color': `${color}70`,
        '--guide-opacity': disabled || !active ? 0.4 : 1,
        '--guide-pointer-events': disabled ? 'none' : undefined,
      })}
    />
  ),
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
        <CompactTitle className={styles.compactTitleWithIcon}>{title}</CompactTitle>
        {subtitle && (
          <CompactSubtitle className={styles.compactSubtitleWithIcon}>{subtitle}</CompactSubtitle>
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
