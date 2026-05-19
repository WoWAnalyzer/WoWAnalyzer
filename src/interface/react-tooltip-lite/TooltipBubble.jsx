/**
 * @class TooltipBubble
 * @description A lightweight and responsive tooltip.
 */
import React from 'react';
import PropTypes from 'prop-types';

import positions from './position';
import { createPortal } from 'react-dom';

// default colors
const defaultColor = '#fff';
const defaultBg = '#333';

const stopProp = (e) => e.stopPropagation();

class TooltipBubble extends React.PureComponent {
  static propTypes = {
    direction: PropTypes.string,
    className: PropTypes.string,
    content: PropTypes.node.isRequired,
    background: PropTypes.string,
    color: PropTypes.string,
    padding: PropTypes.string,
    eventToggle: PropTypes.string,
    useHover: PropTypes.bool,
    useDefaultStyles: PropTypes.bool,
    tipContentHover: PropTypes.bool,
    arrow: PropTypes.bool,
    arrowSize: PropTypes.number,
    distance: PropTypes.number,
    target: PropTypes.object,
    startHover: PropTypes.func,
    endHover: PropTypes.func,
    container: PropTypes.object.isRequired,
  };
  static defaultProps = {
    direction: 'up',
    className: '',
    background: '',
    color: '',
    padding: '10px',
    useHover: true,
    useDefaultStyles: false,
    tipContentHover: false,
    arrow: true,
    arrowSize: 10,
    distance: undefined,
  };

  constructor() {
    super();
    this.tip = React.createRef();
  }

  componentDidMount() {
    // This is necessary because positions relies on the tooltip existing to determine the optimal location
    this.forceUpdate();
  }

  tip = null;

  render() {
    const {
      direction,
      className,
      padding,
      content,
      eventToggle,
      useHover,
      background,
      color,
      useDefaultStyles,
      tipContentHover,
      arrow,
      arrowSize,
      distance,
      target,
      startHover,
      endHover,
      container,
    } = this.props;

    const currentPositions = positions(direction, this.tip.current, target, {
      background: useDefaultStyles ? defaultBg : background,
      arrow,
      arrowSize,
      distance,
    });

    const tipStyles = {
      ...currentPositions.tip,
      background: useDefaultStyles ? defaultBg : background,
      color: useDefaultStyles ? defaultColor : color,
      padding,
      boxSizing: 'border-box',
      zIndex: 1000,
      position: 'absolute',
      display: 'inline-block',
    };

    const portalProps = {
      // keep clicks on the tip from closing click controlled tips
      onClick: stopProp,
    };

    if (!eventToggle && useHover && tipContentHover) {
      portalProps.onMouseEnter = startHover;
      portalProps.onMouseLeave = endHover;
      portalProps.onTouchStart = stopProp;
    }

    return createPortal(
      <div {...portalProps} className={className}>
        <span className="react-tooltip-lite" style={tipStyles} ref={this.tip}>
          {content}
        </span>
        {currentPositions.arrow && (
          <span
            className={`react-tooltip-lite-arrow react-tooltip-lite-${currentPositions.realDirection}-arrow`}
            style={{
              ...currentPositions.arrow,
              position: 'absolute',
              width: 0,
              height: 0,
              zIndex: 1001,
            }}
          />
        )}
      </div>,
      container,
    );
  }
}

export default TooltipBubble;
