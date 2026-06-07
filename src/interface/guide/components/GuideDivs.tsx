import cssComponent from "interface/utils/css-component";
import styles from "./GuideDivs.module.scss";
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PropsWithChildren } from 'react';
import { qualitativePerformanceToColor } from 'interface/guide';

/** A lighter colored panel with rounded edges */
export const RoundedPanel = cssComponent("div", styles.RoundedPanel, [] as const);

/** Container lays out any number of panels side-by-side and forces them to be the same width
 *  Recommend adding no more than 5 items */
export const SideBySidePanels = cssComponent("div", styles.SideBySidePanels, [] as const);

/**
 * Version of {@link RoundedPanel} that aligns content to the start of the
 * box instead of the center.
 */
export const StartAlignedRoundedPanel = cssComponent(RoundedPanel, styles.StartAlignedRoundedPanel, [] as const);

/**
 * Version of {@link StartAlignedRoundedPanel} that has an inset box shadow to show
 * color on the left side of the panel.
 */
const RoundedPanelWithColorBoxShadow = cssComponent(
  StartAlignedRoundedPanel,
  styles.RoundedPanelWithColorBoxShadow,
  ["color"] as const
);

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
export const PanelHeader = cssComponent("div", styles.PanelHeader, [] as const);
