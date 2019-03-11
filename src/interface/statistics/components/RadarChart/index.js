import React from 'react';
import PropTypes from 'prop-types';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { lineRadial, curveCardinalClosed, curveLinearClosed } from 'd3-shape';

import SvgWrappingText from './SvgWrappingText';

// This is heavily based on https://gist.github.com/nbremer/21746a9668ffdf6d8242#file-radarchart-js
// It was severely cleaned up, updated for the d3 version we use, and modified to behave as a component.
// The original code was licensed as "license: mit". These modifications (basically any code not straight from the original) is licensed under the regular license used in this project. If you need a MIT license you should use the code in the above link instead.

export function maxDataValue(data) {
  return data.reduce((dataMax, series) => series.points.reduce((seriesMax, item) => (
    Math.max(seriesMax, item.value)
  ), dataMax), 0);
}

class RadarChart extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    margin: PropTypes.shape({
      top: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number,
      left: PropTypes.number,
    }),
    levels: PropTypes.number,
    maxValue: PropTypes.number,
    labelFactor: PropTypes.number,
    wrapWidth: PropTypes.number,
    opacityArea: PropTypes.number,
    dotRadius: PropTypes.number,
    opacityCircles: PropTypes.number,
    strokeWidth: PropTypes.number,
    roundStrokes: PropTypes.bool,
    color: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.shape({
      color: PropTypes.string,
      points: PropTypes.arrayOf(PropTypes.shape({
        axis: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      })).isRequired,
    })).isRequired,
    labelFormatter: PropTypes.array.isRequired,
  };
  static defaultProps = {
    width: 500, //Width of the circle
    height: 500, //Height of the circle
    margin: { top: 40, right: 40, bottom: 40, left: 40 }, //The margins of the SVG
    levels: 3,				//How many levels or inner circles should there be drawn
    maxValue: 0, 			//What is the value that the biggest circle will represent
    labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
    labelMaxWidth: 60, 		//The number of pixels after which a label needs to be given a new line
    opacityArea: 0.35, 	//The opacity of the area of the blob
    dotRadius: 4, 			//The size of the colored circles of each blog
    opacityCircles: 0.1, 	//The opacity of the circles of each blob
    strokeWidth: 2, 		//The width of the stroke around each blob
    roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
    color: scaleOrdinal(schemeCategory10),	//Color function
  };

  render() {
    const { data, width, height, margin, levels, opacityCircles, labelFactor, labelMaxWidth, roundStrokes, color, opacityArea, strokeWidth, dotRadius, labelFormatter, ...others } = this.props;

    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    const maxValue = Math.max(this.props.maxValue, maxDataValue(data));

    //Names of each axis
    const allAxis = data[0].points.map(i => i.axis);
    //The number of different axes
    const total = allAxis.length;
    //Radius of the outermost circle
    const radius = Math.min(width / 2, height / 2);
    //The width in radians of each "slice"
    const angleSlice = Math.PI * 2 / total;

    //Scale for the radius
    const rScale = scaleLinear()
      .range([0, radius])
      .domain([0, maxValue]);

    //The radial line function
    const radarLine = lineRadial()
      .curve(curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((_, i) => i * angleSlice);
    if (roundStrokes) {
      radarLine.curve(curveCardinalClosed);
    }

    return (
      <svg
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
        className="radar"
        style={{ overflow: 'visible' }}
        {...others}
      >
        <g transform={`translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation={2.5} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g className="axisWrapper">
            {/* the background circles */}
            {[...Array(3).keys()].reverse().map(level => (
              <circle
                className="gridCircle"
                r={radius / levels * (level + 1)}
                style={{
                  fill: '#CDCDCD',
                  stroke: '#CDCDCD',
                  strokeOpacity: 0.5,
                  fillOpacity: opacityCircles,
                  filter: 'url(#glow)',
                }}
              />
            ))}
            {/* the background circle labels */}
            {/* don't merge with the above loop since we need text to overlap ALL circles */}
            {[...Array(3).keys()].reverse().map(level => (
              <text
                className="axisLabel"
                x={4}
                y={-(level + 1) * radius / levels}
                dy="0.4em"
                style={{ fontSize: 10 }}
                fill="rgba(200, 200, 200, 0.7)"
              >
                {labelFormatter(maxValue * (level + 1) / levels)}
              </text>
            ))}
            {/* Create the straight lines radiating outward from the center */}
            {allAxis.map((label, i) => (
              <g className="axis">
                <line
                  className="line"
                  x1={0}
                  y1={0}
                  x2={rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2)}
                  y2={rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2)}
                  style={{
                    stroke: 'white',
                    strokeOpacity: 0.5,
                    strokeWidth: 2,
                  }}
                />
                {/* the labels at the end of each axis */}
                <SvgWrappingText
                  className="legend"
                  style={{ fontSize: 11 }}
                  textAnchor="middle"
                  dy="0.35em"
                  x={rScale(maxValue * labelFactor) * Math.cos(angleSlice * i - Math.PI / 2)}
                  y={rScale(maxValue * labelFactor) * Math.sin(angleSlice * i - Math.PI / 2)}
                  width={labelMaxWidth}
                >
                  {label}
                </SvgWrappingText>
              </g>
            ))}
            {/* Draw the radar chart blobs (value blobs) */}
            {data.map((series, i) => (
              <g className="radarWrapper">
                {/* The backgrounds */}
                <path
                  className="radarArea"
                  d={radarLine(series.points)}
                  style={{
                    fill: series.color || color(i),
                    fillOpacity: opacityArea,
                  }}
                />
                {/* The outlines */}
                <path
                  className="radarStroke"
                  d={radarLine(series.points)}
                  style={{
                    strokeWidth: strokeWidth,
                    stroke: series.color || color(i),
                    fill: 'none',
                    filter: 'url(#glow)',
                  }}
                />
                {/* Circles on the axis to show exact cross over */}
                {series.points.map((point, pointIndex) => (
                  <circle
                    className="radarCircle"
                    r={dotRadius}
                    cx={rScale(point.value) * Math.cos(angleSlice * pointIndex - Math.PI / 2)}
                    cy={rScale(point.value) * Math.sin(angleSlice * pointIndex - Math.PI / 2)}
                    style={{
                      fill: series.color || color(i),
                      fillOpacity: 0.8,
                    }}
                  />
                ))}
              </g>
            ))}
          </g>
        </g>
      </svg>
    );
  }
}

export default RadarChart;

// TODO: Tooltips
// export default function RadarChart(id, data, options) {
//   //Append the circles
//   blobWrapper.selectAll('.radarCircle')
//     .data(function (d, i) {
//       return d;
//     })
//     .enter().append('circle')
//     .attr('class', 'radarCircle')
//     .attr('r', cfg.dotRadius)
//     .attr('cx', function (d, i) {
//       return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
//     })
//     .attr('cy', function (d, i) {
//       return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
//     })
//     .style('fill', function (d, i, j) {
//       return cfg.color(j);
//     })
//     .style('fill-opacity', 0.8);
//
//   /////////////////////////////////////////////////////////
//   //////// Append invisible circles for tooltip ///////////
//   /////////////////////////////////////////////////////////
//
//   //Wrapper for the invisible circles on top
//   const blobCircleWrapper = g.selectAll('.radarCircleWrapper')
//     .data(data)
//     .enter().append('g')
//     .attr('class', 'radarCircleWrapper');
//
//   //Append a set of invisible circles on top for the mouseover pop-up
//   blobCircleWrapper.selectAll('.radarInvisibleCircle')
//     .data(d => d)
//     .enter().append('circle')
//     .attr('class', 'radarInvisibleCircle')
//     .attr('r', cfg.dotRadius * 1.5)
//     .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
//     .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
//     .style('fill', 'none')
//     .style('pointer-events', 'all')
//     .on('mouseover', function (d) {
//       const newX = parseFloat(select(this).attr('cx')) - 10;
//       const newY = parseFloat(select(this).attr('cy')) - 10;
//
//       tooltip
//         .attr('x', newX)
//         .attr('y', newY)
//         .text(Format(d.value))
//         .transition().duration(200)
//         .style('opacity', 1);
//     })
//     .on('mouseout', () => {
//       tooltip.transition().duration(200)
//         .style('opacity', 0);
//     });
//
//   //Set up the small tooltip for when you hover over a circle
//   const tooltip = g.append('text')
//     .attr('class', 'tooltip')
//     .style('opacity', 0);
//
// }//RadarChart
