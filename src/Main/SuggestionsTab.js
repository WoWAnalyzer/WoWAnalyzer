import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import UpArrow from 'Icons/UpArrow';

import Icon from 'common/Icon';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import './SuggestionsTab.css';

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

  getIssueImportance(importance) {
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

  render() {
    const { issues } = this.props;

    return (
      <div>
        <div className="panel-heading">
          <div className="row">
            <div className="col-md-8">
              <h2>Suggestions</h2>
            </div>
            <div className="col-md-4 text-right toggle-control">
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
              <li className="item major" style={{ color: '#25ff00' }}>
                <div className="icon">
                  <Icon icon="thumbsup" alt="Thumbsup" />
                </div>
                <div className="suggestion">
                  There are no major issues in this fight. Good job!
                </div>
              </li>
            )}
            {issues
              .filter(issue => this.state.showMinorIssues || issue.importance !== ISSUE_IMPORTANCE.MINOR)
              .map((issue, i) => (
                <li className={`item ${issue.importance || ''}`} key={`${i}`}>
                  <div className="icon">
                    <Icon icon={issue.icon} alt="Icon" />
                  </div>
                  <div className="suggestion">
                    {issue.issue}
                    {issue.stat && (
                      <div className="stat">{issue.stat}</div>
                    )}
                  </div>
                  <div className="importance">
                    {this.getIssueImportance(issue.importance)}
                  </div>
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
