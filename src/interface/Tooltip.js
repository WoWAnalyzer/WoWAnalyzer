import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from '@wowanalyzer/react-tooltip-lite';

import './Tooltip.scss';

export default class Tooltip extends React.Component {
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
     * Additional class names that are added to the tooltip (wrapper of the tooltip and arrow)
     * Default: ''
     */
    className: PropTypes.string,
    /**
     * Direction of the tooltip, where is it rendered
     * Default: 'down'
     */
    direction: PropTypes.string,
    /**
     * Boolean which states, if a person can access the tooltip contents (and click links, select and copy text etc.)
     * Default: false
     */
    hoverable: PropTypes.bool,
  };

  static defaultProps = {
    className: '',
    direction: 'down',
    hoverable: false,
  };

  render() {
    const {
      content,
      children,
      className,
      direction,
      hoverable,
      ...others
    } = this.props;
    return (
      <ReactTooltip
        className={className}
        direction={direction}
        tipContentHover={hoverable}
        content={content}
        {...others}
      >
        {children}
      </ReactTooltip>
    );
  }
}

export class TooltipElement extends React.Component {
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
     * Additional class names that are appended to the wrapper element
     * Default: ''
     */
    className: PropTypes.string,
    /**
     * Direction of the tooltip, where is it rendered
     * Default: 'down'
     */
    direction: PropTypes.string,
    /**
     * Additional inline styles that are appended to the wrapper element
     * Default: {}
     */
    style: PropTypes.object,
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
    className: '',
    direction: 'down',
    style: {},
    tooltipClassName: '',
    hoverable: false,
  };

  render() {
    const {
      content,
      children,
      className,
      direction,
      style,
      tooltipClassName,
      hoverable,
      ...others
    } = this.props;
    return (
      <ReactTooltip
        content={content}
        className={tooltipClassName}
        direction={direction}
        tipContentHover={hoverable}
        {...others}
      >
        <dfn className={className} style={style}>
          {children}
        </dfn>
      </ReactTooltip>
    );
  }
}
