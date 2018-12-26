import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip-lite';

import './Tooltip.css';

class Tooltip extends React.Component {
  static propTypes = {
    content: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    hoverable: PropTypes.bool,
  };

  static defaultProps = {
    hoverable: false,
  };

  render() {
    const {content, children, hoverable} = this.props;
    // Styles that are applied to the children
    const styles = {
      'border-bottom': '1px dashed #fff',
      cursor: 'help',
    };
    return (
      <ReactTooltip content={content} styles={styles} tipContentHover={hoverable} direction="down">
        {children}
      </ReactTooltip>
    );
  }
}

export default Tooltip;
