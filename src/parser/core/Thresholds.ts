export enum ThresholdStyle {
  BOOLEAN = 'boolean',
  PERCENTAGE = 'percentage',
  NUMBER = 'number',
  THOUSANDS = 'thousands',
  DECIMAL = 'decimal',
  SECONDS = 'seconds',
}

export interface Threshold<T extends number | boolean> {
  style: ThresholdStyle,
  actual: T,
}

export type ThresholdRange = {
  minor: number,
  average?: number,
  major?: number,
}

/* If you're looking here to fix an error, it's likely that you either:
  a) declared more than one comparator for the threshold (i.e isEqual and isLess than, etc.)
  b) didn't declare one at all
 */
interface INumberThreshold extends Threshold<number> {
  max?: number,
  // Require exactly one of the below (including isEqual from parent)
  isEqual: number,
  isLessThan: ThresholdRange,
  isGreaterThan: ThresholdRange,
  isGreaterThanOrEqual: ThresholdRange,
  isLessThanOrEqual: ThresholdRange,
}

export type NumberThreshold = RequireExactlyOne<INumberThreshold,
  'isEqual' | 'isLessThan' | 'isGreaterThan' | 'isGreaterThanOrEqual' | 'isLessThanOrEqual'>

export interface BoolThreshold extends Threshold<boolean> {
  isEqual: boolean,
}

// https://github.com/sindresorhus/type-fest/blob/master/source/require-exactly-one.d.ts
type RequireExactlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & { [K in Keys]-?:
  Required<Pick<T, K>>
  & Partial<Record<Exclude<Keys, K>, undefined>>
}[Keys];
