import styled from '@emotion/styled';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BadColor, GoodColor, OkColor, PerfectColor } from 'interface/guide/index';
import { PropsWithChildren } from 'react';

export const StartAlignedRoundedPanel = styled(RoundedPanel)`
  align-content: start;
`;

export const RoundedPanelWithColorBoxShadow = styled(StartAlignedRoundedPanel)`
  box-shadow: inset 0.5em 0 0 ${(props) => props.color};
`;

const qualitativePerformanceToColor = (qualitativePerformance: QualitativePerformance) => {
  switch (qualitativePerformance) {
    case QualitativePerformance.Perfect:
      return PerfectColor;
    case QualitativePerformance.Good:
      return GoodColor;
    case QualitativePerformance.Ok:
      return OkColor;
    case QualitativePerformance.Fail:
      return BadColor;
  }
};
interface Props {
  performance: QualitativePerformance;
}
export const PerformanceRoundedPanel = ({ children, performance }: PropsWithChildren<Props>) => (
  <RoundedPanelWithColorBoxShadow color={qualitativePerformanceToColor(performance)}>
    {children}
  </RoundedPanelWithColorBoxShadow>
);

export const PanelHeader = styled.div`
  padding: 0.5em 0;
  margin: -1px -1px 0;
`;
