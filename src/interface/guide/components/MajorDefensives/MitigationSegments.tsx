import cssComponent from 'interface/utils/css-component';
import styles from './MitigationSegments.module.scss';
import { formatNumber } from 'common/format';
import Tooltip from 'interface/Tooltip';
import { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';

export interface MitigationSegment {
  amount: number;
  color: string;
  description: ReactNode;
}

const MitigationSegmentContainer = cssComponent(
  'div',
  styles.MitigationSegmentContainer,
  [] as const,
);

// we use content-box sizing with a border because that makes the hitbox bigger, so it is easier to read the tooltips.
export const MitigationTooltipSegment = cssComponent('div', styles.MitigationTooltipSegment, [
  'color',
  'maxWidth',
  'width',
] as const);

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
  <MitigationSegmentContainer className={clsx(className, rounded && styles.rounded)} style={style}>
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
