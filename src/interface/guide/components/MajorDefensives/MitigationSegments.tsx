import cssComponent from 'interface/utils/css-component';
import styles from './MitigationSegments.module.scss';
import { formatNumber } from 'common/format';
import Tooltip from 'interface/Tooltip';
import { CSSProperties, JSX, ReactNode } from 'react';
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

export const MitigationTooltipSegment = ({
  color,
  maxWidth,
  width,
  innerRef,
  children,
  className,
  ...rest
}: {
  color: string;
  maxWidth?: number;
  width: number;
  innerRef?: React.Ref<HTMLDivElement>;
} & React.ComponentProps<'div'>): JSX.Element => {
  const actualWidth = maxWidth
    ? `calc(${Math.max(0.02, width)} * ${maxWidth}px - 1px)`
    : `calc(${Math.max(2, width * 100)}% - 1px)`;

  return (
    <div
      {...rest}
      className={clsx(styles.MitigationTooltipSegment, className)}
      style={{ width: actualWidth, '--color': color }}
    >
      {children}
    </div>
  );
};

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
