import React from 'react';
import PropTypes from 'prop-types';

import Tooltip from 'interface/Tooltip';

import './VerticalLine.css';

const VerticalLine = props => {
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
  } = props;
  // xDomain = [minX, maxX] - e.g. [8022559, 8222902]
  // xRange = [0, maxXpixels] - e.g. [0, 1160]
  // assuming linear scale, these form an equation of a line from [xDomain[0], xRange[0]] to [xDomain[1], xRange[1]]
  // equation taken from Line (geometry) on Wikipedia
  const pixelOffset = (x) => {
    const [x0, x1] = xDomain;
    const [y0, y1] = xRange;
    return (x - x0) * (y1 - y0) / (x1 - x0) + y0;
  };

  const left = Math.round(marginLeft + pixelOffset(value));
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

      {!children && (
        <div
          className="rv-vertical-line__line"
          style={{
            height: `${innerHeight}px`,
            ...style.line,
          }}
        />
      )}

      {children && (
        <Tooltip
          content={children}
          direction={orientation}
        >
          <div
            className="rv-vertical-line__line"
            style={{
              height: `${innerHeight}px`,
              ...style.line,
            }}
          />
        </Tooltip>
      )}
    </div>
  );
};

VerticalLine.propTypes = {
  value: PropTypes.number.isRequired,
  style: PropTypes.shape({
    wrapper: PropTypes.object,
    line: PropTypes.object,
  }),
  className: PropTypes.string,
  children: PropTypes.node,
  xRange: PropTypes.array,
  xDomain: PropTypes.array,
  marginLeft: PropTypes.number,
  marginTop: PropTypes.number,
  innerHeight: PropTypes.number,
  innerWidth: PropTypes.number,
};

VerticalLine.defaultProps = {
  style: {},
  className: '',
};

export default VerticalLine;
