import React from 'react';
import PropTypes from 'prop-types';

import './VerticalLine.scss';

class VerticalLine extends React.Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    style: PropTypes.shape({
      wrapper: PropTypes.object,
      line: PropTypes.object,
    }),
    className: PropTypes.string,
  };

  static defaultProps = {
    style: {},
    className: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false,
    };
  }

  render() {
    const {
      value,
      style,
      className,
      children,
      // ton of properties get injected from XYPlot
      xRange,
      xDomain,
      marginLeft,
      marginTop,
      innerHeight,
      innerWidth,
    } = this.props;
    // xDomain = [minX, maxX] - e.g. [8022559, 8222902]
    // xRange = [0, maxXpixels] - e.g. [0, 1160]
    // interpolate value using those two
    const left = marginLeft + xRange[1] * value / xDomain[1];
    const top = marginTop;
    const orientation = left > innerWidth / 2 ? 'left' : 'right';
    return (
      <div
        className={`rv-vertical-line ${className}`}
        style={{
          left: `${left}px`,
          top: `${top}px`,
          ...style.wrapper,
        }}
      >
        <div
          className="rv-vertical-line__line"
          style={{
            height: `${innerHeight}px`,
            ...style.line,
          }}
          onMouseEnter={() => this.setState({ showTooltip: true })}
          onMouseLeave={() => this.setState({ showTooltip: false })}
        />

        {children && this.state.showTooltip && (
          <div className={`rv-vertical-line__tooltip rv-vertical-line__tooltip--${orientation} react-tooltip-lite`}>
            {children}
          </div>
        )}
      </div>
    );
  }
}

export default VerticalLine;
