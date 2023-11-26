import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BadColor, GoodColor, OkColor, PerfectColor } from './colors';

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

export default qualitativePerformanceToColor;
