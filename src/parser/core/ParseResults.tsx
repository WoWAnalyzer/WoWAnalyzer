import React from 'react'; // eslint-disable-line no-unused-vars
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

type AllowedValue = number | string | boolean;
type ThresholdDef = {
  actual: AllowedValue,
  isEqual?: AllowedValue,
  isLessThan?: ThresholdValue,
  isGreaterThan?: ThresholdValue,
  isLessThanOrEqual?: ThresholdValue,
  isGreaterThanOrEqual?: ThresholdValue,
}

type ThresholdValue = {
  minor: number,
  average: number,
  major: number,
}
export class SuggestionAssertion {
  _actual: AllowedValue;
  _addIssue: (issue: Issue) => void;

  _mode: AssertionMode | null = null;
  _threshold: ThresholdValue | AllowedValue | null = null;

  constructor(options: ThresholdDef | AllowedValue, addIssue: (issue: Issue) => void) {
    if (typeof options === 'object') {
      const def = options as ThresholdDef;
      this._actual = def.actual;
      if (def.isGreaterThan !== undefined) {
        this.isGreaterThan(def.isGreaterThan);
      } else if (def.isGreaterThanOrEqual !== undefined) {
        this.isGreaterThanOrEqual(def.isGreaterThanOrEqual);
      } else if (def.isLessThan !== undefined) {
        this.isLessThan(def.isLessThan);
      } else if (def.isLessThanOrEqual !== undefined) {
        this.isLessThanOrEqual(def.isLessThanOrEqual);
      } else if (def.isEqual !== undefined) {
        this.isEqual(def.isEqual);
      }
    } else {
      this._actual = options;
    }
    this._addIssue = addIssue;
  }

  isGreaterThan(value: ThresholdValue) {
    this._mode = AssertionMode.IS_GREATER_THAN;
    this._threshold = value;
    return this;
  }
  isGreaterThanOrEqual(value: ThresholdValue) {
    this._mode = AssertionMode.IS_GREATER_THAN_OR_EQUAL;
    this._threshold = value;
    return this;
  }
  isLessThan(value: ThresholdValue) {
    this._mode = AssertionMode.IS_LESS_THAN;
    this._threshold = value;
    return this;
  }
  isLessThanOrEqual(value: ThresholdValue) {
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
  isEqual(value: AllowedValue) {
    this._mode = AssertionMode.IS_EQUAL;
    this._threshold = value;
    return this;
  }
  get triggerThreshold(): AllowedValue {
    let threshold = this._threshold;
    if (threshold !== null && typeof threshold === 'object') {
      // `null` is also of type 'object'
      threshold = threshold.minor;
    }
    return threshold;
  }
  _isApplicable() {
    return this._compare(this._actual, this.triggerThreshold);
  }
  _getIssueImportance(suggestion) {
    if (suggestion._staticImportance) {
      return suggestion._staticImportance;
    }

    let majorThreshold = suggestion.majorThreshold;
    let averageThreshold = suggestion.averageThreshold;
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
  _compare(actual: AllowedValue, breakpoint: AllowedValue) {
    switch (this._mode) {
      case AssertionMode.IS_GREATER_THAN: return actual > breakpoint;
      case AssertionMode.IS_GREATER_THAN_OR_EQUAL: return actual >= breakpoint;
      case AssertionMode.IS_LESS_THAN: return actual < breakpoint;
      case AssertionMode.IS_LESS_THAN_OR_EQUAL: return actual <= breakpoint;
      case AssertionMode.IS_TRUE: return !!actual;
      case AssertionMode.IS_FALSE: return !actual;
      case AssertionMode.IS_EQUAL: return actual === breakpoint;
      default: throw new Error('Assertion mode not set.');
    }
  }

  addSuggestion(func: (suggest, actual, recommened) => Suggestion) {
    if (this._isApplicable()) {
      const suggestion = func(suggestionText => new Suggestion(suggestionText), this._actual, this.triggerThreshold);

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
  _text = null;
  _icon = null;
  _actualText = null;
  _recommendedText = null;
  averageThreshold = null;
  majorThreshold = null;
  _staticImportance = null;
  _details = null;

  constructor(text) {
    this._text = text;
  }
  icon(icon) {
    this._icon = icon;
    return this;
  }
  actual(actualText) {
    this._actualText = actualText;
    return this;
  }
  recommended(recommendedText) {
    this._recommendedText = recommendedText;
    return this;
  }
  regular(value) {
    this.averageThreshold = value;
    return this;
  }
  major(value) {
    this.majorThreshold = value;
    return this;
  }
  staticImportance(value) {
    this._staticImportance = value;
    return this;
  }
  details(value) {
    this._details = value;
    return this;
  }
}

export type Issue = {
  issue: suggestion._text,
  // stat is a string and not a React node on purpose: this is quicker and we don't want the stats to become complicated
  stat: string | null,
  icon: suggestion._icon,
  importance: keyof typeof ISSUE_IMPORTANCE,
  details: suggestion._details,
}
class ParseResults {
  tabs = [];
  statistics = [];
  issues: Array<Issue> = [];

  constructor() {
    this.addIssue = this.addIssue.bind(this);
  }

  addIssue(issue: Issue) {
    this.issues.push(issue);
  }

  suggestions = {
    when: (threshold: ThresholdDef | AllowedValues) => new SuggestionAssertion(threshold, this.addIssue),
  };
}

export default ParseResults;
