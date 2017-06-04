import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import UpArrow from 'Icons/UpArrow';

import Icon from 'common/Icon';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class SuggestionsTab extends React.Component {
  static propTypes = {
    issues: PropTypes.array,
  };

  constructor() {
    super();
    this.state = {
      showMinorIssues: false,
    };
  }

  renderIssueImportanceContent(importance) {
    switch (importance) {
      case ISSUE_IMPORTANCE.MAJOR:
        return <span>Major <UpArrow /></span>;
      case ISSUE_IMPORTANCE.REGULAR:
        return 'Average';
      case ISSUE_IMPORTANCE.MINOR:
        return <span>Minor <UpArrow style={{ transform: 'rotate(180deg) translateZ(0)' }} /></span>;
      default:
        return '';
    }
  }
  renderIssueImportance(importance) {
    return (
      <div className="importance">
        {this.renderIssueImportanceContent(importance)}
      </div>
    );
  }

  render() {
    const { issues } = this.props;

    return (
      <div>
        <div className="panel-heading">
          <div className="row">
            <div className="col-md-8">
              <h2>Suggestions</h2>
            </div>
            <div className="col-md-4 text-right minor-issue-toggle">
              <Toggle
                defaultChecked={this.state.showMinorIssues}
                icons={false}
                onChange={event => this.setState({ showMinorIssues: event.target.checked })}
                id="minor-issues-toggle"
              />
              <label htmlFor="minor-issues-toggle">
                Minor importance
              </label>
            </div>
          </div>
        </div>
        <div style={{ padding: 0 }}>
          <ul className="list issues">
            {!issues.find(issue => issue.importance === ISSUE_IMPORTANCE.MAJOR) && (
              <li className="item" style={{ color: '#25ff00' }}>
                <Icon icon="thumbsup" alt="Thumbsup" /> There are no major issues in this fight. Good job!
              </li>
            )}
            {issues
              .filter(issue => this.state.showMinorIssues || issue.importance !== ISSUE_IMPORTANCE.MINOR)
              .map((issue, i) => (
                <li className={`item ${issue.importance  || ''}`} key={`${i}`}>
                  {this.renderIssueImportance(issue.importance)}
                  <Icon icon={issue.icon} alt="Icon" /> {issue.issue}
                </li>
              ))}
            <li className="text-muted" style={{ paddingTop: 10, paddingBottom: 10 }}>
              Some of these suggestions may be nitpicky or fight dependent, but often it's still something you could look to improve. Try to focus on improving one thing at a time - don't try to improve everything at once.
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default SuggestionsTab;
