import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexibleWidthXYPlot as XYPlot,
  XAxis,
  YAxis,
  AreaSeries,
  LineSeries,
  MarkSeries,
  Hint,
} from 'react-vis';

import { formatPercentage } from 'common/format';

import './OneVariableBinomialChart.scss';

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
      tickFormat: PropTypes.func.isRequired,
    }).isRequired,
    yAxis: PropTypes.shape({
      title: PropTypes.string.isRequired,
      tickFormat: PropTypes.func.isRequired,
    }),
    tooltip: PropTypes.func.isRequired,
    curve: PropTypes.string,
    xDomain: PropTypes.array,
    yDomain: PropTypes.array,
  };

  static defaultProps = {
    curve: 'curveCardinal',
    yAxis: {
      title: 'Likelihood',
      tickFormat: (value) => `${formatPercentage(value, 0)}%`,
    },
  };

  state = {
    hover: null,
  };

  render() {
    const {
      probabilities,
      actualEvent,
      xAxis,
      yAxis,
      tooltip,
      curve,
      xDomain,
      yDomain,
    } = this.props;
    return (
      <XYPlot
        height={150}
        xDomain={xDomain}
        yDomain={yDomain}
        onMouseLeave={() => this.setState({ hover: null })}
      >
        <XAxis {...xAxis} />
        <YAxis {...yAxis} />
        <AreaSeries
          data={probabilities}
          color="rgba(255, 139, 45, 0.2)"
          stroke="transparent"
          curve={curve}
        />
        <LineSeries
          data={probabilities}
          stroke="rgba(255, 139, 45, 1)"
          strokeStyle="solid"
          curve={curve}
        />
        <MarkSeries
          data={[ actualEvent ]}
          color="#00ff96"
          onNearestX={d => this.setState({ hover: d })}
          size={3}
        />
        {this.state.hover && (
          <Hint
            value={this.state.hover}
            align={{
              horizontal: 'right',
              vertical: 'bottom',
            }}
          >
            <div className="react-tooltip-lite value-tooltip">
              {tooltip(this.state.hover)}
            </div>
          </Hint>
        )}
      </XYPlot>
    );
  }
}

export default OneVariableBinomialChart;
