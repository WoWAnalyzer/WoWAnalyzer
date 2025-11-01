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
  margin-bottom: 16px;
`;

/** Row for stat cards */
export const StatsRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

/** Individual stat card with colored border */
export const StatCard = styled.div<{ color: string }>`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 6px 12px;
  min-width: 70px;
  border-left: 3px solid ${(props) => props.color};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

/** Stat value (large number/text) */
export const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  margin-bottom: 2px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`;

/** Stat label (small descriptive text) */
export const StatLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/** Grid layout for displaying multiple stat items */
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
`;

/** Individual stat item with colored border (for grid display) */
export const StatItem = styled.div<{ color: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 12px 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 3px solid ${(props) => props.color};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

/** Stat item value (customizable font size, left-aligned) */
export const StatItemValue = styled.div<{ fontSize?: string }>`
  font-size: ${(props) => props.fontSize || '2rem'};
  font-weight: 700;
  color: #fff;
  line-height: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  text-align: left;
  margin-bottom: 4px;
`;

/** Stat item label (left-aligned) */
export const StatItemLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
  margin-bottom: 4px;
`;

/** Helper text - small italicized text for additional context */
export const HelperText = styled.div`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
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
  gap: 8px;
  align-items: center;
`;

/** Navigation button (previous/next) */
export const NavButton = styled.button<{ disabled?: boolean }>`
  width: 32px;
  height: 32px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: ${(props) => (props.disabled ? '#666' : '#fab700')};
  font-size: 2rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};

  &:hover:not(:disabled) {
    background: rgba(250, 183, 0, 0.2);
    border-color: #fab700;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

/** Counter/info display between navigation buttons */
export const NavCounter = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  min-width: 50px;
  text-align: center;
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
