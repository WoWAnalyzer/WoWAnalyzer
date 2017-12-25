import ISSUE_IMPORTANCE from './ISSUE_IMPORTANCE';


const ASSERTION_MODES = {
  IS_GREATER_THAN: '>',
  IS_GREATER_THAN_OR_EQUAL: '>=',
  IS_LESS_THAN: '<',
  IS_LESS_THAN_OR_EQUAL: '<=',
  IS_TRUE: '==true',
  IS_FALSE: '==false',
};
class SuggestionAssertion {
  _actual = null;
  _addIssue = null;

  _mode = null;
  _breakpoint = null;

  constructor(actual, addIssue) {
    this._actual = actual;
    this._addIssue = addIssue;
  }

  isGreaterThan(value) {
    this._mode = ASSERTION_MODES.IS_GREATER_THAN;
    this._breakpoint = value;
    return this;
  }
  isGreaterThanOrEqual(value) {
    this._mode = ASSERTION_MODES.IS_GREATER_THAN_OR_EQUAL;
    this._breakpoint = value;
    return this;
  }
  isLessThan(value) {
    this._mode = ASSERTION_MODES.IS_LESS_THAN;
    this._breakpoint = value;
    return this;
  }
  isLessThanOrEqual(value) {
    this._mode = ASSERTION_MODES.IS_LESS_THAN_OR_EQUAL;
    this._breakpoint = value;
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
  _isApplicable() {
    return this._compare(this._actual, this._breakpoint);
  }
  _getIssueImportance(suggestion) {
    if (suggestion._staticImportance) {
      return suggestion._staticImportance;
    }
    if (this._compare(this._actual, suggestion._breakpointMajor)) {
      return ISSUE_IMPORTANCE.MAJOR;
    }
    if (this._compare(this._actual, suggestion._breakpointRegular)) {
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
      default: throw new Error('Assertion mode not set.');
    }
  }

  addSuggestion(func) {
    if (this._isApplicable()) {
      const suggestion = func(suggestionText => new Suggestion(suggestionText), this._actual, this._breakpoint);

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
  _breakpointRegular = null;
  _breakpointMajor = null;
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
    this._breakpointRegular = value;
    return this;
  }
  major(value) {
    this._breakpointMajor = value;
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
