import React from 'react';
import PropTypes from 'prop-types';
import { AutoSizer } from 'react-virtualized';

import BaseChart from './BaseChart';

class OneVariableBinomialChart extends React.Component {
  static propTypes = {
    probabilities: PropTypes.arrayOf(
      PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      }),
    ).isRequired,
    actualEvent: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    xAxis: PropTypes.shape({
      title: PropTypes.string.isRequired,
      tickFormat: PropTypes.string.isRequired,
    }).isRequired,
    yAxis: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }),
    yDomain: PropTypes.arrayOf(PropTypes.number),
    tooltip: PropTypes.string.isRequired,
  };

  state = {
    hover: null,
  };

  render() {
    const { probabilities, actualEvent, xAxis, yAxis, yDomain, tooltip } = this.props;

    const data = {
      probabilities,
      actual: actualEvent,
    };

    const spec = {
      encoding: {
        x: {
          field: 'x',
          type: 'quantitative',
          title: xAxis.title,
          axis: {
            grid: false,
            format: xAxis.tickFormat,
          },
        },
        y: {
          field: 'y',
          type: 'quantitative',
          title: yAxis.title,
          axis: {
            grid: false,
            format: '.0%',
          },
          scale: {
            domain: yDomain,
          },
        },
      },
      layer: [
        {
          data: {
            name: 'probabilities',
          },
          mark: {
            type: 'area',
            color: 'rgba(250, 183, 0, 0.15)',
            line: {
              color: '#fab700',
              strokeWidth: 1,
            },
          },
        },
        {
          data: {
            name: 'actual',
          },
          mark: {
            type: 'point',
            filled: true,
            color: '#00ff96',
            size: 60,
          },
          encoding: {
            tooltip: [{ field: 'x', title: tooltip }],
          },
        },
      ],
    };

    return (
      <AutoSizer disableHeight>
        {({ width }) => <BaseChart height={150} width={width} spec={spec} data={data} />}
      </AutoSizer>
    );
  }
}

export default OneVariableBinomialChart;
