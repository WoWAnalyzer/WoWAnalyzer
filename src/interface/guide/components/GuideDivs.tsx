/**
 * Layout primitives used widely across analysis modules.
 * Component-specific styles have moved: see GuideDataWrapper, CastDetail, CastSequence, BuffUptimeBar.
 */
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ComponentPropsWithoutRef, CSSProperties, PropsWithChildren } from 'react';
import { qualitativePerformanceToColor } from 'interface/guide';

import styles from './GuideDivs.module.scss';

type DivProps = ComponentPropsWithoutRef<'div'>;

const getClassName = (...classNames: Array<string | undefined>) =>
  classNames.filter((className) => className).join(' ');

/** A lighter colored panel with rounded edges */
export const RoundedPanel = ({ children, className, ...props }: PropsWithChildren<DivProps>) => (
  <div className={getClassName(styles['rounded-panel'], className)} {...props}>
    {children}
  </div>
);

/** Container lays out any number of panels side-by-side and forces them to be the same width
 *  Recommend adding no more than 5 items */
export const SideBySidePanels = ({
  children,
  className,
  ...props
}: PropsWithChildren<DivProps>) => (
  <div className={getClassName(styles['side-by-side-panels'], className)} {...props}>
    {children}
  </div>
);

/**
 * Version of {@link RoundedPanel} that aligns content to the start of the
 * box instead of the center.
 */
export const StartAlignedRoundedPanel = ({
  children,
  className,
  ...props
}: PropsWithChildren<DivProps>) => (
  <div
    className={getClassName(
      styles['rounded-panel'],
      styles['start-aligned-rounded-panel'],
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

/**
 * Version of {@link StartAlignedRoundedPanel} that has an inset box shadow to show
 * color on the left side of the panel.
 */
interface Props {
  performance: QualitativePerformance;
}

type PerformanceRoundedPanelProps = PropsWithChildren<Props & DivProps>;

/**
 * Version of {@link StartAlignedRoundedPanel} that shows the color for the given performance
 * as an inset box shadow.
 */
export const PerformanceRoundedPanel = ({
  children,
  className,
  performance,
  style,
  ...props
}: PerformanceRoundedPanelProps) => (
  <div
    className={getClassName(
      styles['rounded-panel'],
      styles['start-aligned-rounded-panel'],
      styles['performance-rounded-panel'],
      className,
    )}
    style={
      {
        ...(style ?? {}),
        '--performance-panel-color': qualitativePerformanceToColor(performance),
      } as CSSProperties
    }
    {...props}
  >
    {children}
  </div>
);

/**
 * Simple div to give the "header" for a panel some spacing from the other content in the panel.
 */
export const PanelHeader = ({ children, className, ...props }: PropsWithChildren<DivProps>) => (
  <div className={getClassName(styles['panel-header'], className)} {...props}>
    {children}
  </div>
);
