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
 * Helper function to get the average perf from an array for an overall perf
 * @param perfs array of QualitativePerformance enums
 * @returns average QualitativePerformance in array
 */
export function getAveragePerf(perfs: QualitativePerformance[]) {
  if (perfs.length === 0) {
    return QualitativePerformance.Fail;
  }
  let total = 0;
  const order = [
    QualitativePerformance.Fail,
    QualitativePerformance.Ok,
    QualitativePerformance.Good,
    QualitativePerformance.Perfect,
  ];
  const orderArr = perfs.map((perf) => {
    return order.indexOf(perf);
  });
  orderArr.forEach((i) => {
    total += i;
  });
  const average = Math.floor(total / orderArr.length);
  return order[average];
}

/**
 * Helper function to get the lowest perf from an array to easily reduce to an overall perf
 * @param perfs array of QualitativePerformance enums
 * @returns lowest QualitativePerformance in array
 */
export function getLowestPerf(perfs: QualitativePerformance[]): QualitativePerformance {
  if (perfs.length === 0) {
    return QualitativePerformance.Perfect;
  }
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

export function getPerformanceExplanation(performance: QualitativePerformance): string {
  switch (performance) {
    case QualitativePerformance.Perfect:
      return 'Perfect usage';
    case QualitativePerformance.Good:
      return 'Good usage';
    case QualitativePerformance.Ok:
      return 'Ok usage';
    case QualitativePerformance.Fail:
      return 'Bad usage';
  }
}

export function evaluateQualitativePerformanceByThreshold(
  threshold: QualitativePerformanceThreshold,
): QualitativePerformance {
  return new QualitativePerformanceAssertion(threshold)._getPerformance();
}

export type QualitativePerformanceThresholdRange = {
  fail?: number;
  ok?: number;
  good?: number;
  perfect?: number;
};

/* If you're looking here to fix an error, it's likely that you either:
  a) declared more than one comparator for the threshold (i.e isEqual and isLess than, etc.)
  b) didn't declare one at all
 */
interface BaseQualitativePerformanceThreshold {
  actual: number;
  max?: number;
  // Require exactly one of the below
  isEqual: number;
  isLessThan: number | QualitativePerformanceThresholdRange;
  isGreaterThan: number | QualitativePerformanceThresholdRange;
  isGreaterThanOrEqual: number | QualitativePerformanceThresholdRange;
  isLessThanOrEqual: number | QualitativePerformanceThresholdRange;
}

export type QualitativePerformanceThreshold = RequireExactlyOne<
  BaseQualitativePerformanceThreshold,
  'isEqual' | 'isLessThan' | 'isGreaterThan' | 'isGreaterThanOrEqual' | 'isLessThanOrEqual'
>;

// https://github.com/sindresorhus/type-fest/blob/master/source/require-exactly-one.d.ts
type RequireExactlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

enum AssertionMode {
  IS_GREATER_THAN = '>',
  IS_GREATER_THAN_OR_EQUAL = '>=',
  IS_LESS_THAN = '<',
  IS_LESS_THAN_OR_EQUAL = '<=',
  IS_TRUE = '==true',
  IS_FALSE = '==false',
  IS_EQUAL = '===',
}

class QualitativePerformanceAssertion {
  _actual!: number;
  _threshold?: number | QualitativePerformanceThresholdRange;
  _mode?: AssertionMode | null;

  constructor(options: QualitativePerformanceThreshold) {
    this._actual = options.actual;
    if (options.isEqual !== undefined) {
      this.isEqual(options.isEqual);
    } else if (options.isGreaterThan !== undefined) {
      this.isGreaterThan(options.isGreaterThan);
    } else if (options.isGreaterThanOrEqual !== undefined) {
      this.isGreaterThanOrEqual(options.isGreaterThanOrEqual);
    } else if (options.isLessThan !== undefined) {
      this.isLessThan(options.isLessThan);
    } else if (options.isLessThanOrEqual !== undefined) {
      this.isLessThanOrEqual(options.isLessThanOrEqual);
    } else {
      // Potentially error here; used an object to define the actual but didn't set thresholds?
    }
  }

  isGreaterThan(value: number | QualitativePerformanceThresholdRange) {
    this._mode = AssertionMode.IS_GREATER_THAN;
    this._threshold = value;
    return this;
  }

  isGreaterThanOrEqual(value: number | QualitativePerformanceThresholdRange) {
    this._mode = AssertionMode.IS_GREATER_THAN_OR_EQUAL;
    this._threshold = value;
    return this;
  }

  isLessThan(value: number | QualitativePerformanceThresholdRange) {
    this._mode = AssertionMode.IS_LESS_THAN;
    this._threshold = value;
    return this;
  }

  isLessThanOrEqual(value: number | QualitativePerformanceThresholdRange) {
    this._mode = AssertionMode.IS_LESS_THAN_OR_EQUAL;
    this._threshold = value;
    return this;
  }

  isEqual(value: number) {
    this._mode = AssertionMode.IS_EQUAL;
    this._threshold = value;
    return this;
  }

  get _triggerThreshold(): number {
    let threshold = this._threshold;
    // `null` is also of type 'object'
    if (threshold !== null && typeof threshold === 'object') {
      threshold = threshold.fail ?? threshold.ok ?? threshold.good ?? threshold.perfect;
    }
    if (threshold === undefined) {
      throw new Error('You must set a number threshold before finalizing the suggestion');
    }
    return threshold;
  }

  _isApplicable(value: number) {
    return this._compare(value, this._triggerThreshold);
  }

  _compare(actual: number, breakpoint: number | undefined) {
    if (breakpoint === undefined) {
      throw new Error('Number thresholds not set');
    }
    switch (this._mode) {
      case AssertionMode.IS_GREATER_THAN:
        return actual > breakpoint;
      case AssertionMode.IS_GREATER_THAN_OR_EQUAL:
        return actual >= breakpoint;
      case AssertionMode.IS_LESS_THAN:
        return actual < breakpoint;
      case AssertionMode.IS_LESS_THAN_OR_EQUAL:
        return actual <= breakpoint;
      case AssertionMode.IS_EQUAL:
        return actual === breakpoint;
      default:
        throw new Error('Assertion mode not set.');
    }
  }

  _getPerformance(): QualitativePerformance {
    if (typeof this._threshold === 'object') {
      if (
        this._threshold.perfect !== undefined &&
        this._compare(this._actual, this._threshold.perfect)
      ) {
        return QualitativePerformance.Perfect;
      }
      if (this._threshold.good !== undefined && this._compare(this._actual, this._threshold.good)) {
        return QualitativePerformance.Good;
      }
      if (this._threshold.ok !== undefined && this._compare(this._actual, this._threshold.ok)) {
        return QualitativePerformance.Ok;
      }
      if (this._threshold.fail !== undefined && this._compare(this._actual, this._threshold.fail)) {
        return QualitativePerformance.Fail;
      }
      return QualitativePerformance.Fail;
    } else {
      return this._compare(this._actual, this._threshold)
        ? QualitativePerformance.Perfect
        : QualitativePerformance.Fail;
    }
  }
}
