import styled from '@emotion/styled';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ComponentProps, ReactNode } from 'react';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';

export const ColoredText = styled.span`
  color: ${(props) => props.color};
`;

interface PerformanceProps extends ComponentProps<typeof ColoredText> {
  children: ReactNode;
  performance: QualitativePerformance;
}
export const PerformanceLabel = ({ performance, ...others }: PerformanceProps) => (
  <>
    <ColoredText color={qualitativePerformanceToColor(performance)} {...others} />
    <PerformanceMark perf={performance} />
  </>
);
