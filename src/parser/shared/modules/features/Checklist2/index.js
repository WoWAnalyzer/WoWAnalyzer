import React from 'react';
import PropTypes from 'prop-types';

import './Checklist.css';

class Checklist extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    footNote: PropTypes.node,
  };

  render() {
    const { children, footNote } = this.props;

    return (
      <div className="checklist">
        {!children && (
          <div className="item-divider" style={{ padding: '10px 22px' }}>
            <div className="alert alert-danger">
              The checklist is not yet available for this spec. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.
            </div>
          </div>
        )}

        {children}

        {footNote && (
          <div className="checklist-item text-muted">
            {footNote}
          </div>
        )}
      </div>
    );
  }
}

export default Checklist;
