import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

// not pleased with this due to it possibly going through the array multiple times, but
// we probably won't have multiple long array where this will cause an issue.
export const combineQualitativePerformances = (
  performances: QualitativePerformance[],
): QualitativePerformance => {
  if (performances.some((it) => it === QualitativePerformance.Fail)) {
    return QualitativePerformance.Fail;
  }
  if (performances.some((it) => it === QualitativePerformance.Ok)) {
    return QualitativePerformance.Ok;
  }
  if (performances.some((it) => it === QualitativePerformance.Good)) {
    return QualitativePerformance.Good;
  }
  return QualitativePerformance.Perfect;
};
