/**
 * Created by joe on 16/9/2.
 * Source: https://raw.githubusercontent.com/qiaolb/react-dragscroll/master/src/DragScroll.jsx
 * This was cleaned up. A lot.
 */

import React from 'react';
import PropTypes from 'prop-types';

class DragScroll extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.object,
  };
  static defaultProps = {
    style: {},
  };

  container = null;
  constructor(props) {
    super(props);
    this.state = {
      data: props.dataSource,
      dragging: false,
    };
    this.container = React.createRef();
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  render() {
    const { children, style, ...others } = this.props;

    return (
      <div
        onMouseDown={this.handleMouseDown}
        ref={this.container}
        style={{
          ...style,
          cursor: this.state.dragging ? 'grabbing' : 'grab',
        }}
        {...others}
      >
        {children}
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
  }
  componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  lastClientX = null;
  lastClientY = null;
  handleMouseDown(e) {
    if (e.button !== 0) {
      // Only handle left click
      return;
    }
    this.setState(state => {
      if (!state.dragging) {
        return {
          ...state,
          dragging: true,
        };
      }
      return state;
    });
    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;
    e.preventDefault();
  }
  handleMouseUp(e) {
    this.setState(state => {
      if (state.dragging) {
        return {
          ...state,
          dragging: false,
        };
      }
      return state;
    });
  }
  handleMouseMove(e) {
    if (this.state.dragging) {
      this.container.current.scrollLeft -= (-this.lastClientX + (this.lastClientX = e.clientX));
      this.container.current.scrollTop -= (-this.lastClientY + (this.lastClientY = e.clientY));
    }
  }

  isArray(object) {
    return object && typeof object === 'object' &&
      typeof object.length === 'number' &&
      typeof object.splice === 'function' &&
      //判断length属性是否是可枚举的 对于数组 将得到false
      !(object.propertyIsEnumerable('length'));
  }
}

export default DragScroll;
