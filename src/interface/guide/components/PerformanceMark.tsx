import './Guide.scss';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BadMark, GoodMark, OkMark, PerfectMark } from './Marks';

/** Shows a glyph depending on given performance */
const PerformanceMark = ({ perf }: { perf: QualitativePerformance }) => {
  switch (perf) {
    case QualitativePerformance.Perfect:
      return <PerfectMark />;
    case QualitativePerformance.Good:
      return <GoodMark />;
    case QualitativePerformance.Ok:
      return <OkMark />;
    case QualitativePerformance.Fail:
      return <BadMark />;
  }
};

export default PerformanceMark;
