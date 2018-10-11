import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import { Trans } from '@lingui/macro';

import Icon from 'common/Icon';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

import Suggestion from './Suggestion';
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

  render() {
    const { issues } = this.props;

    return (
      <>
        <div className="panel-heading">
          <div className="row">
            <div className="col-md-8">
              <h2><Trans>Suggestions</Trans></h2>
            </div>
            <div className="col-md-4 text-right toggle-control">
              <Toggle
                defaultChecked={this.state.showMinorIssues}
                icons={false}
                onChange={event => this.setState({ showMinorIssues: event.target.checked })}
                id="minor-issues-toggle"
              />
              <label htmlFor="minor-issues-toggle">
                <Trans>Minor importance</Trans>
              </label>
            </div>
          </div>
        </div>
        <div>
          <ul className="list issues">
            {!issues.find(issue => issue.importance === ISSUE_IMPORTANCE.MAJOR) && (
              <li className="item major" style={{ color: '#25ff00' }}>
                <div className="icon">
                  <Icon icon="thumbsup" alt="Thumbsup" />
                </div>
                <div className="suggestion">
                  <Trans>There are no major issues in this fight. Good job!</Trans>
                </div>
              </li>
            )}
            {issues
              .filter(issue => this.state.showMinorIssues || issue.importance !== ISSUE_IMPORTANCE.MINOR)
              .map((issue, i) => <Suggestion key={i} {...issue} />)}
            <li className="text-muted" style={{ paddingTop: 10, paddingBottom: 10 }}>
              <Trans>Some of these suggestions may be nitpicky or fight dependent, but often it's still something you could look to improve. Try to focus on improving one thing at a time - don't try to improve everything at once.</Trans>
            </li>
          </ul>
        </div>
      </>
    );
  }
}

export default SuggestionsTab;
