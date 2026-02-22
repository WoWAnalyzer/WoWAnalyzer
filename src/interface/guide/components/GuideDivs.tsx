/**
 * Some emotion components for common containers
 */
import styled from '@emotion/styled';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PropsWithChildren } from 'react';
import { qualitativePerformanceToColor } from 'interface/guide';

/** A lighter colored panel with rounded edges */
export const RoundedPanel = styled.div`
  background: #222;
  border-radius: 0.5em;
  padding: 1em 1.5em;
  display: grid;
  grid-gap: 1rem;
  align-content: center;
  align-items: center;
`;

/** Container lays out any number of panels side-by-side and forces them to be the same width
 *  Recommend adding no more than 5 items */
export const SideBySidePanels = styled.div`
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  grid-column-gap: 1em;
`;

/**
 * Version of {@link RoundedPanel} that aligns content to the start of the
 * box instead of the center.
 */
const StartAlignedRoundedPanel = styled(RoundedPanel)`
  align-content: start;
`;

/**
 * Version of {@link StartAlignedRoundedPanel} that has an inset box shadow to show
 * color on the left side of the panel.
 */
const RoundedPanelWithColorBoxShadow = styled(StartAlignedRoundedPanel)`
  box-shadow: inset 0.5em 0 0 ${(props) => props.color};
`;

interface Props {
  performance: QualitativePerformance;
}

/**
 * Version of {@link StartAlignedRoundedPanel} that shows the color for the given performance
 * as an inset box shadow.
 */
export const PerformanceRoundedPanel = ({ children, performance }: PropsWithChildren<Props>) => (
  <RoundedPanelWithColorBoxShadow color={qualitativePerformanceToColor(performance)}>
    {children}
  </RoundedPanelWithColorBoxShadow>
);

/**
 * Simple div to give the "header" for a panel some spacing from the other content in the panel.
 */
export const PanelHeader = styled.div`
  padding: 0.5em 0;
  margin: -1px -1px 0;
  align-content: center;
  & svg {
    height: 24px;
  }
`;

/** Container for entire component section */
export const SectionContainer = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
`;

/** Row for stat cards */
export const StatsRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

/** Stat card — bordered card with value | divider | label side by side */
export const StatCard = styled.div<{ color: string }>`
  display: flex;
  align-items: stretch;
  border: 1px solid ${(props) => props.color}45;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-height: 44px;
`;

/** Value half of a StatCard */
export const StatCardValue = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  font-size: 1.9rem;
  font-weight: 700;
  color: ${(props) => props.color};
  line-height: 1;
  flex-shrink: 0;
`;

/** Partial-height vertical divider inside a StatCard */
export const StatCardDivider = styled.div<{ color: string }>`
  width: 1px;
  height: 55%;
  align-self: center;
  background: ${(props) => props.color}35;
  flex-shrink: 0;
`;

/** Label half of a StatCard — can wrap to two lines */
export const StatCardLabel = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 10px;
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  line-height: 1.2;
  flex: 1;
`;

/** Stat value (large number/text) */
export const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
`;

/** Stat label (small descriptive text) */
export const StatLabel = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/** 3-column grid layout for stat cards */
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 6px;
`;

/** Helper text - small italicized text for additional context */
export const HelperText = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
  font-style: italic;
`;

/** Container row for helper text and labels */
export const HelperTextRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

/** Container for navigation buttons */
export const NavigationButtons = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 999px;
  padding: 2px;
`;

/** Navigation button — larger touch target, mobile-friendly */
export const NavButton = styled.button<{ disabled?: boolean }>`
  min-width: 32px;
  height: 32px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, ${(props) => (props.disabled ? '0.04' : '0.1')});
  border-radius: 6px;
  color: ${(props) => (props.disabled ? 'rgba(255,255,255,0.15)' : '#fab700')};
  font-size: 1.8rem;
  font-weight: 400;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  line-height: 1;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background: rgba(250, 183, 0, 0.12);
    border-color: rgba(250, 183, 0, 0.35);
  }

  &:active:not(:disabled) {
    transform: scale(0.9);
    background: rgba(250, 183, 0, 0.18);
  }
`;

/** Counter/info display between navigation buttons */
export const NavCounter = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  min-width: 36px;
  text-align: center;
`;

/** 4-column grid of performance count badges — shared by CastSummary and CastDetail */
export const PerfBadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
`;

/** Numeric count cell inside a perf badge */
export const PerfBadgeCount = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(p) => p.color};
  line-height: 1;
  flex-shrink: 0;
`;

/** Partial-height vertical divider inside a perf badge */
export const PerfBadgeDivider = styled.div<{ color: string }>`
  width: 1px;
  height: 55%;
  align-self: center;
  background: ${(p) => p.color}40;
  flex-shrink: 0;
`;

/** Label cell inside a perf badge */
export const PerfBadgeLabel = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  line-height: 1.2;
  flex: 1;
`;

/** Content container with scrolling capability */
export const ScrollableContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 6px 12px 6px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 10px;
    cursor: default !important;
  }

  &::-webkit-scrollbar-track {
    background: rgba(104, 103, 100, 0.15);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #fab700;
  }
`;
