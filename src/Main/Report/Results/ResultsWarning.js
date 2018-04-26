import React from 'react';
import PropTypes from 'prop-types';

import Warning from 'common/Alert/Warning';

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
      <div style={{ borderBottom: '1px solid #000', boxShadow: '0 1px 0 0 rgba(255, 255, 255, .1)' }}>
        <Warning>
          {warning}
        </Warning>
      </div>
    );
  }
}

export default ResultsWarning;
