import { clsx } from 'clsx';
import { formatNumber } from 'common/format';
import Tooltip from 'interface/Tooltip';
import { CSSProperties, type HTMLAttributes, ReactNode } from 'react';

import styles from './MitigationSegments.module.scss';

export interface MitigationSegment {
  amount: number;
  color: string;
  description: ReactNode;
}

const mitigationTooltipSegmentSelector = 'mitigation-tooltip-segment';

interface MitigationSegmentContainerProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: boolean;
}

const MitigationSegmentContainer = ({
  rounded,
  className,
  ...props
}: MitigationSegmentContainerProps) => (
  <div {...props} className={clsx(styles.container, rounded && styles.rounded, className)} />
);

// we use content-box sizing with a border because that makes the hitbox bigger, so it is easier to read the tooltips.
interface MitigationTooltipSegmentProps extends HTMLAttributes<HTMLDivElement> {
  color: string;
  width: number;
  maxWidth?: number;
}

const getSegmentWidth = (width: number, maxWidth?: number) =>
  maxWidth
    ? `calc(${Math.max(0.02, width)} * ${maxWidth}px - 1px)`
    : `calc(${Math.max(2, width * 100)}% - 1px)`;

export const MitigationTooltipSegment = Object.assign(
  ({ color, width, maxWidth, className, style, ...props }: MitigationTooltipSegmentProps) => (
    <div
      {...props}
      className={clsx(styles.tooltipSegment, mitigationTooltipSegmentSelector, className)}
      style={
        {
          ...style,
          '--mitigation-segment-color': color,
          '--mitigation-segment-width': getSegmentWidth(width, maxWidth),
        } as CSSProperties
      }
    />
  ),
  {
    __emotion_styles: [],
    toString: () => `.${mitigationTooltipSegmentSelector}`,
  },
);

export const MitigationSegments = ({
  segments,
  maxValue,
  className,
  rounded,
  style,
}: {
  segments: MitigationSegment[];
  maxValue: number;
  className?: string;
  rounded?: boolean;
  style?: CSSProperties;
}) => (
  <MitigationSegmentContainer rounded={rounded} className={className} style={style}>
    {segments
      .filter((seg) => seg.amount > 0)
      .map((seg, ix) => (
        <Tooltip
          content={
            <>
              {seg.description} - {formatNumber(seg.amount)}
            </>
          }
          key={ix}
        >
          <MitigationTooltipSegment color={seg.color} width={seg.amount / maxValue} />
        </Tooltip>
      ))}
  </MitigationSegmentContainer>
);
