import React from 'react';
import PropTypes from 'prop-types';

import UpArrow from 'Icons/UpArrow';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import Icon from 'common/Icon';

function getIssueImportance(importance) {
  switch (importance) {
    case ISSUE_IMPORTANCE.MAJOR:
      return <React.Fragment>Major <UpArrow /></React.Fragment>;
    case ISSUE_IMPORTANCE.REGULAR:
      return 'Average';
    case ISSUE_IMPORTANCE.MINOR:
      return <React.Fragment>Minor <UpArrow style={{ transform: 'rotate(180deg) translateZ(0)' }} /></React.Fragment>;
    default:
      return '';
  }
}

class Suggestion extends React.PureComponent {
  static propTypes = {
    icon: PropTypes.string.isRequired,
    issue: PropTypes.node.isRequired,
    stat: PropTypes.node,
    importance: PropTypes.string.isRequired,
    details: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { icon, issue, stat, importance, details } = this.props;

    return (
      <React.Fragment>
        <li className={`item ${importance || ''} ${details ? 'clickable' : ''}`} onClick={details && this.handleClick}>
          <div className="icon">
            <Icon icon={icon} alt="Icon" />
          </div>
          <div className="suggestion">
            {issue}
            {stat && (
              <div className="stat">{stat}</div>
            )}
          </div>
          <div className="importance">
            {/* element needed for vertical alignment */}
            <div>
              {getIssueImportance(importance)}
            </div>
          </div>
        </li>
        {this.state.expanded && details && (
          <li>
            {details()}
          </li>
        )}
      </React.Fragment>
    );
  }
}

export default Suggestion;
