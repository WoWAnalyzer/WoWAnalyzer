import React from 'react';
import { BoolThreshold, NumberThreshold, Threshold, ThresholdRange, ThresholdStyle } from 'parser/core/Thresholds';
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

class SuggestionAssertion<T extends number | boolean> {
  _actual!: T;
  _addIssue: (issue: Issue) => void;

  constructor(addIssue: (issue: Issue) => void) {
    this._addIssue = addIssue;
  }

  get _triggerThreshold(): T {
    throw new Error('Use child class');
  }

  _isApplicable(): boolean {
    throw new Error('Use child class');
  }

  _getIssueImportance(suggestion: Suggestion): ISSUE_IMPORTANCE {
    throw new Error('Use child class');
  }

  addSuggestion(func: (suggest: SuggestionFactory, actual: T, recommended: T) => Suggestion) {
    if (this._isApplicable()) {
      const suggestion = func((suggestionText: React.ReactNode) => new Suggestion(suggestionText), this._actual, this._triggerThreshold);

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

export class NumberSuggestionAssertion extends SuggestionAssertion<number> {
  _threshold?: number | ThresholdRange;
  _mode?: AssertionMode | null;

  constructor(options: number | NumberThreshold, addIssue: (issue: Issue) => void) {
    super(addIssue);
    if (typeof options !== 'object') {
      this._actual = options;
      return;
    }
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

  isEqual(value: number) {
    this._mode = AssertionMode.IS_EQUAL;
    this._threshold = value;
    return this;
  }

  get _triggerThreshold(): number {
    const threshold = this._threshold;
    if(threshold === undefined) {
      throw new Error("You must set a number threshold before finalizing the suggestion");
    }
    // `null` is also of type 'object'
    if (threshold !== null && typeof threshold === 'object') {
      return threshold.minor;
    }
    return threshold;
  }

  _isApplicable() {
    return this._compare(this._actual, this._triggerThreshold);
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
}

export class BoolSuggestionAssertion extends SuggestionAssertion<boolean> {
  _compareTo?: boolean;

  constructor(options: boolean | BoolThreshold, addIssue: (issue: Issue) => void) {
    super(addIssue);
    if (typeof options === 'object') {
      this._actual = options.actual;
      this._compareTo = options.isEqual;
    } else {
      this._actual = options;
    }
  }

  isTrue() {
    this._compareTo = true;
    return this;
  }

  isFalse() {
    this._compareTo = false;
    return this;
  }

  isEqual(value: boolean) {
    this._compareTo = value;
    return this;
  }

  get _triggerThreshold(): boolean {
    if(this._compareTo === undefined) {
      throw new Error("You must set a boolean target before finalizing the suggestion");
    }
    return this._compareTo;
  }

  _isApplicable() {
    return this._compare(this._actual, this._triggerThreshold);
  }

  _getIssueImportance(suggestion: Suggestion): ISSUE_IMPORTANCE {
    if (suggestion._staticImportance) {
      return suggestion._staticImportance;
    }
    return ISSUE_IMPORTANCE.MINOR;
  }

  _compare(actual: boolean, breakpoint: boolean | undefined) {
    if (breakpoint === undefined) {
      throw new Error('Boolean threshold comparable not set');
    }
    return actual === breakpoint;
  }
}

type SuggestionFactory = (suggest: React.ReactNode) => Suggestion;

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

type ValidParams = number | boolean | BoolThreshold | NumberThreshold;
type GenericSuggestionType<T extends ValidParams> =
  T extends number ? NumberSuggestionAssertion :
    T extends boolean ? BoolSuggestionAssertion :
      T extends NumberThreshold ? NumberSuggestionAssertion :
        T extends BoolThreshold ? BoolSuggestionAssertion : never;

export type When = <T extends ValidParams>(threshold: T) => GenericSuggestionType<T>;

class ParseResults {
  tabs: React.ReactNode[] = [];
  statistics: React.ReactNode[] = [];
  issues: Array<Issue> = [];

  constructor() {
    this.addIssue = this.addIssue.bind(this);
  }

  addIssue(issue: Issue) {
    this.issues.push(issue);
  }

  suggestions = {
    /* All sorts of hackery here related to trying to use both numerical and boolean params for the
    same methods. Will require pretty hefty refactoring to resolve completely in a type-safe way, but
    we can typecheck everything else while keeping the "bad" code into this one method with the ts-ignores.
    */
    when: <T extends ValidParams>(threshold: T): GenericSuggestionType<T> => {
      if (typeof threshold === "number") {
        // @ts-ignore
        return new NumberSuggestionAssertion(threshold, this.addIssue);
      } else if (typeof threshold === "boolean") {
        // @ts-ignore
        return new BoolSuggestionAssertion(threshold, this.addIssue);
      } else if (typeof threshold === "object") {
        const th = threshold as Threshold<any>;
        switch (th.style) {
          case ThresholdStyle.BOOLEAN:
            // @ts-ignore
            return new BoolSuggestionAssertion(threshold, this.addIssue);
          default:
            // @ts-ignore
            return new NumberSuggestionAssertion(threshold, this.addIssue);
        }
      }
      throw new Error("Invalid threshold type");
    },
  }

}

export default ParseResults;
