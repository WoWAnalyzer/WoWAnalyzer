import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { BoolThreshold, NumberThreshold, ThresholdRange, ThresholdStyle } from 'parser/core/Thresholds';
import ISSUE_IMPORTANCE from './ISSUE_IMPORTANCE';

enum AssertionMode {
  IS_GREATER_THAN = '>',
  IS_GREATER_THAN_OR_EQUAL = '>=',
  IS_LESS_THAN = '<',
  IS_LESS_THAN_OR_EQUAL = '<=',
  IS_TRUE = '==true',
  IS_FALSE = '==false',
  IS_EQUAL = '===',
}

export class SuggestionAssertion {
  _actual: number | boolean;
  _addIssue: (issue: Issue) => void;

  _mode: AssertionMode | null = null;
  _threshold?: number | boolean | ThresholdRange;

  constructor(options: WhenThresholds, addIssue: (issue: Issue) => void) {
    this._addIssue = addIssue;
    if (typeof options === 'object') {
      const def = options;
      this._actual = def.actual;
      if (def.isEqual !== undefined) {
        this.isEqual(def.isEqual);
        return;
      }
      // @ts-ignore for js files that arent typechecked
      if(def.style === ThresholdStyle.BOOLEAN) {
        throw new Error("For boolean thresholds the only valid comparator is isEqual");
      }
      if (def.isGreaterThan !== undefined) {
        this.isGreaterThan(def.isGreaterThan);
      } else if (def.isGreaterThanOrEqual !== undefined) {
        this.isGreaterThanOrEqual(def.isGreaterThanOrEqual);
      } else if (def.isLessThan !== undefined) {
        this.isLessThan(def.isLessThan);
      } else if (def.isLessThanOrEqual !== undefined) {
        this.isLessThanOrEqual(def.isLessThanOrEqual);
      }
    } else {
      this._actual = options;
    }
  }

  isGreaterThan(value: number | ThresholdRange) {
    this._mode = AssertionMode.IS_GREATER_THAN;
    this._threshold = value;
    return this;
  }
  isGreaterThanOrEqual(value: number | ThresholdRange) {
    this._mode = AssertionMode.IS_GREATER_THAN_OR_EQUAL;
    this._threshold = value;
    return this;
  }
  isLessThan(value: number | ThresholdRange) {
    this._mode = AssertionMode.IS_LESS_THAN;
    this._threshold = value;
    return this;
  }
  isLessThanOrEqual(value: number | ThresholdRange) {
    this._mode = AssertionMode.IS_LESS_THAN_OR_EQUAL;
    this._threshold = value;
    return this;
  }
  isTrue() {
    this._mode = AssertionMode.IS_TRUE;
    return this;
  }
  isFalse() {
    this._mode = AssertionMode.IS_FALSE;
    return this;
  }
  isEqual(value: number | boolean) {
    this._mode = AssertionMode.IS_EQUAL;
    this._threshold = value;
    return this;
  }
  get triggerThreshold(): number | boolean | undefined {
    const threshold = this._threshold;
    // `null` is also of type 'object'
    if (threshold !== null && typeof threshold === 'object') {
      return threshold.minor;
    }
    return threshold;
  }
  _isApplicable() {
    return this._compare(this._actual, this.triggerThreshold);
  }
  _getIssueImportance(suggestion: Suggestion): ISSUE_IMPORTANCE {
    if (suggestion._staticImportance) {
      return suggestion._staticImportance;
    }

    let majorThreshold: number | undefined = suggestion.majorThreshold;
    let averageThreshold: number | undefined = suggestion.averageThreshold;
    if (this._threshold !== null && typeof this._threshold === 'object') {
      // This gets priority because we want people to use this method over the old method that's used above.
      majorThreshold = this._threshold.major;
      averageThreshold = this._threshold.average;
    }

    if (majorThreshold !== undefined && this._compare(this._actual, majorThreshold)) {
      return ISSUE_IMPORTANCE.MAJOR;
    }
    if (averageThreshold !== undefined && this._compare(this._actual, averageThreshold)) {
      return ISSUE_IMPORTANCE.REGULAR;
    }
    return ISSUE_IMPORTANCE.MINOR;
  }
  _compare(actual: number | boolean, breakpoint: number | boolean | undefined) {
    if(breakpoint === undefined) {
      switch (this._mode) {
        case AssertionMode.IS_TRUE: return !!actual;
        case AssertionMode.IS_FALSE: return !actual;
        default: throw new Error('Threshold not defined for numerical comparator');
      }
    }
    switch (this._mode) {
      case AssertionMode.IS_GREATER_THAN: return actual > breakpoint;
      case AssertionMode.IS_GREATER_THAN_OR_EQUAL: return actual >= breakpoint;
      case AssertionMode.IS_LESS_THAN: return actual < breakpoint;
      case AssertionMode.IS_LESS_THAN_OR_EQUAL: return actual <= breakpoint;
      case AssertionMode.IS_EQUAL: return actual === breakpoint;
      case AssertionMode.IS_TRUE: return !!actual;
      case AssertionMode.IS_FALSE: return !actual;
      default: throw new Error('Assertion mode not set.');
    }
  }

  addSuggestion(func: (suggest: React.ReactNode, actual: number | boolean, recommended: number | boolean | undefined) => Suggestion) {
    if (this._isApplicable()) {
      const suggestion = func((suggestionText: React.ReactNode) => new Suggestion(suggestionText), this._actual, this.triggerThreshold);

      this._addIssue({
        issue: suggestion._text,
        // stat is a string and not a React node on purpose: this is quicker and we don't want the stats to become complicated
        stat: suggestion._actualText ? <>{suggestion._actualText} ({suggestion._recommendedText})</> : null,
        icon: suggestion._icon,
        importance: this._getIssueImportance(suggestion),
        details: suggestion._details,
      });
    }
  }

}
class Suggestion {
  _text: React.ReactNode;
  _icon?: string;
  _actualText: React.ReactNode = null;
  _recommendedText: string | null = null;
  averageThreshold?: number;
  majorThreshold?: number;
  _staticImportance: ISSUE_IMPORTANCE | null = null;
  _details: (() => React.ReactNode) | null = null;

  constructor(text: React.ReactNode) {
    this._text = text;
  }
  icon(icon: string) {
    this._icon = icon;
    return this;
  }
  actual(actualText: React.ReactNode) {
    this._actualText = actualText;
    return this;
  }
  recommended(recommendedText: string) {
    this._recommendedText = recommendedText;
    return this;
  }
  regular(value: number) {
    this.averageThreshold = value;
    return this;
  }
  major(value: number) {
    this.majorThreshold = value;
    return this;
  }
  staticImportance(value: ISSUE_IMPORTANCE) {
    this._staticImportance = value;
    return this;
  }
  details(value: () => React.ReactNode) {
    this._details = value;
    return this;
  }
}

export type Issue = {
  icon?: string,
  issue: React.ReactNode,
  stat?: React.ReactNode,
  importance: ISSUE_IMPORTANCE,
  details: (() => React.ReactNode) | null
}

type WhenThresholds = number | boolean | NumberThreshold | BoolThreshold;
export type When = (threshold: WhenThresholds) => SuggestionAssertion;

class ParseResults {
  tabs: Analyzer['tab'][] = [];
  statistics: Analyzer['statistic'][] = [];
  issues: Array<Issue> = [];

  constructor() {
    this.addIssue = this.addIssue.bind(this);
  }

  addIssue(issue: Issue) {
    this.issues.push(issue);
  }

  suggestions: { when: When } = {
    when: (threshold) => new SuggestionAssertion(threshold, this.addIssue),
  };
}

export default ParseResults;
