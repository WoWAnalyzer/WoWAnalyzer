import { ParseResultsTab } from 'parser/core/Analyzer';
import type { ReactElement } from 'react';

export enum ThresholdStyle {
  BOOLEAN = 'boolean',
  PERCENTAGE = 'percentage',
  NUMBER = 'number',
  THOUSANDS = 'thousands',
  DECIMAL = 'decimal',
  SECONDS = 'seconds',
}

export interface Threshold<T extends number | boolean> {
  style: ThresholdStyle;
  actual: T;
}

interface ThresholdRange {
  minor?: number;
  average?: number;
  major?: number;
}

/* If you're looking here to fix an error, it's likely that you either:
  a) declared more than one comparator for the threshold (i.e isEqual and isLess than, etc.)
  b) didn't declare one at all
 */
interface BaseNumberThreshold extends Threshold<number> {
  max?: number;
  // Require exactly one of the below
  isEqual: number;
  isLessThan: number | ThresholdRange;
  isGreaterThan: number | ThresholdRange;
  isGreaterThanOrEqual: number | ThresholdRange;
  isLessThanOrEqual: number | ThresholdRange;
}

export type NumberThreshold = RequireExactlyOne<
  BaseNumberThreshold,
  'isEqual' | 'isLessThan' | 'isGreaterThan' | 'isGreaterThanOrEqual' | 'isLessThanOrEqual'
>;

export interface BoolThreshold extends Threshold<boolean> {
  isEqual: boolean;
}

// https://github.com/sindresorhus/type-fest/blob/master/source/require-exactly-one.d.ts
type RequireExactlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

class ParseResults {
  tabs: ParseResultsTab[] = [];
  statistics: ReactElement[] = [];
}

export default ParseResults;
