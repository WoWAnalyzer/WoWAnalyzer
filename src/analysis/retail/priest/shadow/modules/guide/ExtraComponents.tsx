import styled from '@emotion/styled';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ComponentProps, ReactNode } from 'react';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';

export const ColoredStrong = styled.strong`
  color: ${(props) => props.color};
`;

interface PerformanceStrongProps extends ComponentProps<typeof ColoredStrong> {
  children: ReactNode;
  performance: QualitativePerformance;
}
export const PerformanceStrong = ({ performance, ...others }: PerformanceStrongProps) => (
  <>
    <ColoredStrong color={qualitativePerformanceToColor(performance)} {...others} />
    &nbsp;
    <PerformanceMark perf={performance} />
  </>
);
