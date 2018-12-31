import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from '@wowanalyzer/react-tooltip-lite';

import './Tooltip.css';

class Tooltip extends React.Component {
  static propTypes = {
    /**
     * REQUIRED: Content of the tooltip
     */
    content: PropTypes.node.isRequired,
    /**
     * REQUIRED: The text/element that triggers the tooltip
     */
    children: PropTypes.node.isRequired,
    /**
     * Tag name of the wrapper element
     * Default: 'dfn'
     */
    tagName: PropTypes.string,
    /**
     * Additional class names that are appended to the wrapper element
     * Default: ''
     */
    className: PropTypes.string,
    /**
     * Additional inline styles that are appended to the wrapper element
     * Default: {}
     */
    wrapperStyles: PropTypes.object,
    /**
     * Additional class names that are added to the tooltip (wrapper of the tooltip and arrow)
     * Default: ''
     */
    tooltipClassName: PropTypes.string,
    /**
     * Boolean which states, if a person can access the tooltip contents (and click links, select and copy text etc.)
     * Default: false
     */
    hoverable: PropTypes.bool,
  };

  static defaultProps = {
    tagName: 'dfn',
    className: '',
    wrapperStyles: {},
    tooltipClassName: '',
    hoverable: false,
  };

  defaultWrapperStyle = {
    display: 'inline-block',
  };

  render() {
    const {
      content,
      children,
      tagName,
      className,
      wrapperStyles,
      tooltipClassName,
      hoverable,
      ...others
    } = this.props;
    // Styles that are applied to the wrapper element
    const wrapperStyle = {
      ...this.defaultWrapperStyle,
      ...wrapperStyles,
    };
    return (
      <ReactTooltip
        tagName={tagName}
        className={className}
        styles={wrapperStyle}
        tooltipClassName={tooltipClassName}
        direction="down"
        tipContentHover={hoverable}
        content={content}
        {...others}
      >
        {children}
      </ReactTooltip>
    );
  }
}

export default Tooltip;
