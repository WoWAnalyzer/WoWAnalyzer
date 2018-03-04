import React from 'react';
import PropTypes from 'prop-types';

class Alert extends React.PureComponent {
  static propTypes = {
    kind: PropTypes.oneOf(['danger', 'warning', 'info']),
    children: PropTypes.node.isRequired,
  };

  render() {
    const { kind, children } = this.props;

    return (
      <div className={`alert alert-${kind}`}>
        {children}
      </div>
    );
  }
}

export default Alert;
