import React from 'react';
import PropTypes from 'prop-types';

class Checklist extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    const { children } = this.props;

    return (
      <React.Fragment>
        {!children && (
          <div className="item-divider" style={{ padding: '10px 22px' }}>
            <div className="alert alert-danger">
              The checklist is not yet available for this spec. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.
            </div>
          </div>
        )}

        {children}
      </React.Fragment>
    );
  }
}

export default Checklist;
