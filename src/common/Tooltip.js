import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip-lite';

import './Tooltip.css';

class Tooltip extends React.Component {
  static propTypes = {
    content: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    hoverable: PropTypes.bool,
    showUnderline: PropTypes.bool,
  };

  static defaultProps = {
    hoverable: false,
    showUnderline: true,
  };

  render() {
    const {content, children, hoverable, showUnderline} = this.props;
    // Styles that are applied to the children
    let styles = { display: 'inline-block' };
    if (showUnderline) {
      styles = {
        ...styles,
        'border-bottom': '1px dashed currentColor',
        cursor: 'help',
      };
    }
    return (
      <ReactTooltip content={content} styles={styles} tipContentHover={hoverable} direction="down">
        {children}
      </ReactTooltip>
    );
  }
}

export default Tooltip;
