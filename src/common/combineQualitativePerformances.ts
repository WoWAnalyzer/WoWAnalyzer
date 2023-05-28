import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

/**
 * Converts a given {@link QualitativePerformance} to a number representation (necessary since
 * QualitativePerformance is a string enum).
 *
 * @param {QualitativePerformance} performance QualitativePerformance to convert to a number
 * @returns {number} Number representation of QualitativePerformance
 */
export const qualitativePerformanceToNumber = (performance: QualitativePerformance) => {
  switch (performance) {
    case QualitativePerformance.Perfect:
      return 3;
    case QualitativePerformance.Good:
      return 2;
    case QualitativePerformance.Ok:
      return 1;
    case QualitativePerformance.Fail:
      return 0;
  }
};

/**
 * Converts a given number to a {@link QualitativePerformance}.
 *
 * @param {number} performance Number to convert to QualitativePerformance
 * @returns {QualitativePerformance} QualitativePerformance represented by given number
 */
export const numberToQualitativePerformance = (performance: number) => {
  switch (performance) {
    case 3:
      return QualitativePerformance.Perfect;
    case 2:
      return QualitativePerformance.Good;
    case 1:
      return QualitativePerformance.Ok;
    default:
      return QualitativePerformance.Fail;
  }
};

/**
 * Returns the lowest {@link QualitativePerformance} from the given array, defaulting to
 * {@link QualitativePerformance.Perfect} if the array is empty.
 *
 * @param {QualitativePerformance[]} performances Performances to combine
 * @param {QualitativePerformance} defaultPerformance Default performance if no values are present in performances
 * @returns {QualitativePerformance} Lowest performance value from the given array
 */
export const combineQualitativePerformances = (
  performances: QualitativePerformance[],
  defaultPerformance: QualitativePerformance = QualitativePerformance.Perfect,
) =>
  performances.reduce(
    (prev, curr) =>
      numberToQualitativePerformance(
        Math.min(qualitativePerformanceToNumber(prev), qualitativePerformanceToNumber(curr)),
      ),
    defaultPerformance,
  );
