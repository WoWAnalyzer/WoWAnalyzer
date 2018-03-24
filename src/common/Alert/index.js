import React from 'react';
import PropTypes from 'prop-types';

class Alert extends React.PureComponent {
  static propTypes = {
    kind: PropTypes.oneOf(['danger', 'warning', 'info']),
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
  };

  render() {
    const { kind, children, className, ...others } = this.props;

    return (
      <div className={`alert alert-${kind} ${className || ''}`} {...others}>
        {children}
      </div>
    );
  }
}

export default Alert;
