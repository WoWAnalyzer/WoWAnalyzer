/**
 * An expression of qualitative performance. An evaluation need not include every rank allowed here,
 * using only two or three of them depending on the mechanic is perfectly acceptable.
 *
 * The ranking descriptions are as follows:
 * 'perfect' - the player did the mechanic perfectly
 * 'good' - the player did the mechanic correctly
 * 'ok' - the player did the mechanic suboptimally, but it's not a big deal
 * 'fail' - the player did the mechanic incorrectly
 *
 * If a boolean is provided instead, true is equivalent to 'good' and false is equivalent to 'fail'.
 */
export const enum QualitativePerformance {
  Perfect = 'Perfect',
  Good = 'Good',
  Ok = 'Ok',
  Fail = 'Fail',
}

/**
 * Helper function to get the lowest perf from an array to easily reduce to an overall perf
 * @param perfs array of QualitativePerformance enums
 * @returns lowest QualitativePerformance in array
 */
export function getLowestPerf(perfs: QualitativePerformance[]) {
  const order = [
    QualitativePerformance.Fail,
    QualitativePerformance.Ok,
    QualitativePerformance.Good,
    QualitativePerformance.Perfect,
  ];
  const orderArr = perfs.map((perf) => {
    return order.indexOf(perf);
  });
  const lowestPerf = orderArr.reduce((accum, cur) => {
    return cur < accum ? cur : accum;
  });
  return order[lowestPerf];
}
