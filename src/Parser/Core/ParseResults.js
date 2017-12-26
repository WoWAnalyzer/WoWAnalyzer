import ISSUE_IMPORTANCE from './ISSUE_IMPORTANCE';


const ASSERTION_MODES = {
  IS_GREATER_THAN: '>',
  IS_GREATER_THAN_OR_EQUAL: '>=',
  IS_LESS_THAN: '<',
  IS_LESS_THAN_OR_EQUAL: '<=',
  IS_TRUE: '==true',
  IS_FALSE: '==false',
  IS_EQUAL: '===',
};
class SuggestionAssertion {
  _actual = null;
  _addIssue = null;

  _mode = null;
  _threshold = null;

  constructor(options, addIssue) {
    if (typeof options === 'object') {
      this._actual = options.actual;
      if (options.isGreaterThan !== undefined) {
        this.isGreaterThan(options.isGreaterThan);
      } else if (options.isGreaterThanOrEqual !== undefined) {
        this.isGreaterThanOrEqual(options.isGreaterThanOrEqual);
      } else if (options.isLessThan !== undefined) {
        this.isLessThan(options.isLessThan);
      } else if (options.isLessThanOrEqual !== undefined) {
        this.isLessThanOrEqual(options.isLessThanOrEqual);
      } else if (options.isTrue !== undefined) {
        this.isTrue(options.isTrue);
      } else if (options.isFalse !== undefined) {
        this.isFalse(options.isFalse);
      } else if (options.isEqual !== undefined) {
        this.isEqual(options.isEqual);
      }
    } else {
      this._actual = options;
    }
    this._addIssue = addIssue;
  }

  isGreaterThan(value) {
    this._mode = ASSERTION_MODES.IS_GREATER_THAN;
    this._threshold = value;
    return this;
  }
  isGreaterThanOrEqual(value) {
    this._mode = ASSERTION_MODES.IS_GREATER_THAN_OR_EQUAL;
    this._threshold = value;
    return this;
  }
  isLessThan(value) {
    this._mode = ASSERTION_MODES.IS_LESS_THAN;
    this._threshold = value;
    return this;
  }
  isLessThanOrEqual(value) {
    this._mode = ASSERTION_MODES.IS_LESS_THAN_OR_EQUAL;
    this._threshold = value;
    return this;
  }
  isTrue() {
    this._mode = ASSERTION_MODES.IS_TRUE;
    return this;
  }
  isFalse() {
    this._mode = ASSERTION_MODES.IS_FALSE;
    return this;
  }
  isEqual(value) {
    this._mode = ASSERTION_MODES.IS_EQUAL;
    this._threshold = value;
    return this;
  }
  get triggerThreshold() {
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
    if (typeof this._threshold === 'object') {
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
  _compare(actual, breakpoint) {
    switch (this._mode) {
      case ASSERTION_MODES.IS_GREATER_THAN: return actual > breakpoint;
      case ASSERTION_MODES.IS_GREATER_THAN_OR_EQUAL: return actual >= breakpoint;
      case ASSERTION_MODES.IS_LESS_THAN: return actual < breakpoint;
      case ASSERTION_MODES.IS_LESS_THAN_OR_EQUAL: return actual <= breakpoint;
      case ASSERTION_MODES.IS_TRUE: return !!actual;
      case ASSERTION_MODES.IS_FALSE: return !actual;
      case ASSERTION_MODES.IS_EQUAL: return actual === breakpoint;
      default: throw new Error('Assertion mode not set.');
    }
  }

  addSuggestion(func) {
    if (this._isApplicable()) {
      const suggestion = func(suggestionText => new Suggestion(suggestionText), this._actual, this.triggerThreshold);

      this._addIssue({
        issue: suggestion._text,
        stat: suggestion._actualText ? `${suggestion._actualText} (${suggestion._recommendedText})` : null,
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

class ParseResults {
  tabs = [];
  statistics = [];
  items = [];
  issues = [];

  constructor() {
    this.addIssue = this.addIssue.bind(this);
  }

  addIssue(issue) {
    this.issues.push(issue);
  }

  suggestions = {
    when: actual => new SuggestionAssertion(actual, this.addIssue),
  };
}

export default ParseResults;
