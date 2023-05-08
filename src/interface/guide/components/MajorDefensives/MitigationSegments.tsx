import styled from '@emotion/styled';
import { formatNumber } from 'common/format';
import Tooltip from 'interface/Tooltip';
import { ReactNode } from 'react';

export type MitigationSegment = {
  amount: number;
  color: string;
  description: ReactNode;
};

const roundedContainerStyles = `
  border-radius: 2px;
  overflow: clip;

  & div:first-child {
    border-radius: 2px 0 0 2px;
  }
`;

const MitigationSegmentContainer = styled.div<{ rounded?: boolean }>`
  width: 100%;
  height: 1em;
  text-align: left;
  line-height: 1em;
  background-color: rgba(255, 255, 255, 0.2);
  ${(props) => (props.rounded ? roundedContainerStyles : '')}
`;

// we use content-box sizing with a border because that makes the hitbox bigger, so it is easier to read the tooltips.
export const MitigationTooltipSegment = styled.div<{ color: string; width: number }>`
  background-color: ${(props) => props.color};
  width: calc(${(props) => Math.max(2, props.width * 100)}% - 1px);
  height: 100%;
  display: inline-block;
  box-sizing: content-box;
  border-left: 1px solid #000;
`;

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
  style?: React.CSSProperties;
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
