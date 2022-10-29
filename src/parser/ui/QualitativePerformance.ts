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
