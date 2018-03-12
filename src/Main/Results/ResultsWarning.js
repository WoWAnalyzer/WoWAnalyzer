import React from 'react';
import PropTypes from 'prop-types';

import WarningIcon from 'Icons/Warning';

class ResultsWarning extends React.PureComponent {
  static propTypes = {
    warning: PropTypes.node,
  };

  render() {
    const { warning } = this.props;
    if (!warning) {
      return null;
    }

    return (
      <div style={{ borderBottom: '1px solid #000', boxShadow: '0 1px 0 0 rgba(255, 255, 255, .1)', padding: '10px 40px 10px 0px' }}>{/* this padding top/bottom allows there to be a minimal space around the text, */}
        <div className="flex-sub content-middle" style={{ color: '#FFA100', opacity: 0.8 }}>
          <div style={{ fontSize: '4em', lineHeight: 1, margin: '-5px 20px' }}>
            <WarningIcon />
          </div>
          <div>
            {warning}
          </div>
        </div>
      </div>
    );
  }
}

export default ResultsWarning;
