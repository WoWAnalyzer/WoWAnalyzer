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
export const StartAlignedRoundedPanel = styled(RoundedPanel)`
  align-content: start;
`;

/**
 * Version of {@link StartAlignedRoundedPanel} that has an inset box shadow to show
 * color on the left side of the panel.
 */
export const RoundedPanelWithColorBoxShadow = styled(StartAlignedRoundedPanel)`
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
