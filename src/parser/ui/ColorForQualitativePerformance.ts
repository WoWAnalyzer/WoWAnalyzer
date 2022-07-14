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
export type QualitativePerformance = boolean | 'perfect' | 'good' | 'ok' | 'fail';

// TODO the 'good' 'ok' and 'fail' colors are copied from colorForPerformance, should this be centralized?
export function colorForQualitativePerformance(perf: QualitativePerformance): string {
  if (perf === 'perfect') {
    return '#2090c0';
  } else if (perf === true || perf === 'good') {
    return '#4ec04e';
  } else if (perf === 'ok') {
    return '#ffc84a';
  } else {
    // fail / false
    return '#ac1f39';
  }
}
