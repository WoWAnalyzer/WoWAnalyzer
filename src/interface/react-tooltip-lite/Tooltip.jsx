/**
 * @class Tooltip
 * @description The container of a lightweight and responsive tooltip.
 */
import React from 'react';
import PropTypes from 'prop-types';

import TooltipBubble from './TooltipBubble';

class Tooltip extends React.PureComponent {
  static propTypes = {
    direction: PropTypes.string,
    className: PropTypes.string,
    content: PropTypes.node.isRequired,
    background: PropTypes.string,
    color: PropTypes.string,
    padding: PropTypes.string,
    eventOn: PropTypes.string,
    eventOff: PropTypes.string,
    eventToggle: PropTypes.string,
    useHover: PropTypes.bool,
    useDefaultStyles: PropTypes.bool,
    isOpen: PropTypes.bool,
    tipContentHover: PropTypes.bool,
    arrow: PropTypes.bool,
    arrowSize: PropTypes.number,
    distance: PropTypes.number,
    portalContainer: PropTypes.object.isRequired,
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

    this.state = {
      showTip: false,
    };

    this.target = React.createRef();
    this.tip = React.createRef();

    this.showTip = this.showTip.bind(this);
    this.hideTip = this.hideTip.bind(this);
    this.toggleTip = this.toggleTip.bind(this);
    this.startHover = this.startHover.bind(this);
    this.endHover = this.endHover.bind(this);
  }

  componentDidMount() {
    // if the isOpen prop is passed on first render we need to immediately trigger a second render,
    // because the tip ref is needed to calculate the position
    if (this.props.isOpen) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ isOpen: true });
    }
  }

  target = null;
  tip = null;

  toggleTip() {
    this.setState({ showTip: !this.state.showTip });
  }

  showTip() {
    this.setState({ showTip: true });
  }

  hideTip() {
    this.setState({ showTip: false });
  }

  startHover() {
    this.setState({ showTip: true });
  }

  endHover() {
    this.setState({ showTip: false });
  }

  render() {
    const {
      direction,
      className,
      padding,
      children,
      content,
      eventOn,
      eventOff,
      eventToggle,
      useHover,
      background,
      color,
      useDefaultStyles,
      isOpen,
      tipContentHover,
      arrow,
      arrowSize,
      distance,
      portalContainer,
      ...others
    } = this.props;

    const showTip = typeof isOpen === 'undefined' ? this.state.showTip : isOpen;

    const props = {};

    // event handling
    if (eventOff) {
      props[eventOff] = this.hideTip;
    }

    if (eventOn) {
      props[eventOn] = this.showTip;
    }

    if (eventToggle) {
      props[eventToggle] = this.toggleTip;

      // only use hover if they don't have a toggle event
    } else if (useHover) {
      props.onMouseEnter = this.startHover;
      props.onMouseLeave = tipContentHover ? this.endHover : this.hideTip;
      props.onTouchStart = this.toggleTip;
    }

    if (React.Children.count(children) !== 1) {
      throw new Error(
        'You must pass exactly one child element into Tooltip that it can attach to.',
      );
    }
    if (children.type.toString() === 'Symbol(react.fragment)') {
      throw new Error('The one child element passed into Tooltip cannot be a React Fragment.');
    }

    // map other properties and most importantly, reference to the inner DOM component
    const updatedChildren = React.Children.map(children, (child) => {
      const additionalProps = {
        ...props,
        ...others,
      };
      if (typeof child.type === 'function') {
        // if the Tooltip is attaching to another React Component
        // the inner React Component MUST handle the passing of the ref on its own (as well as spread other props (most importantly the events)
        // oxlint-disable-next-line react/no-clone-element
        return React.cloneElement(child, {
          innerRef: this.target,
          ...additionalProps,
        });
      }
      // or an HTML node
      // oxlint-disable-next-line react/no-clone-element
      return React.cloneElement(child, {
        ref: this.target,
        ...additionalProps,
      });
    });
    return (
      <React.Fragment>
        {updatedChildren}
        {showTip && (
          <TooltipBubble
            direction={direction}
            className={className}
            content={content}
            background={background}
            color={color}
            padding={padding}
            eventToggle={eventToggle}
            useHover={useHover}
            useDefaultStyles={useDefaultStyles}
            tipContentHover={tipContentHover}
            arrow={arrow}
            arrowSize={arrowSize}
            distance={distance}
            target={this.target.current}
            startHover={this.startHover}
            endHover={this.endHover}
            container={portalContainer}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Tooltip;
