import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexibleWidthXYPlot as XYPlot,
  DiscreteColorLegend,
  XAxis,
  YAxis,
  AreaSeries,
  LineSeries,
  Crosshair,
  Highlight,
  MarkSeries,
} from 'react-vis';

import { formatDuration, formatNumber } from 'common/format';
import VerticalLine from 'interface/others/charts/VerticalLine';

import './StaggerGraph.scss';

const COLORS = {
  death: 'red',
  purify: '#00ff96',
  stagger: 'rgb(240, 234, 214)',
  hp: 'rgb(255, 139, 45)',
  maxHp: 'rgb(183, 76, 75)',
};

class StaggerGraph extends React.Component {
  static propTypes = {
    stagger: PropTypes.array.isRequired,
    hp: PropTypes.array.isRequired,
    maxHp: PropTypes.array.isRequired,
    purifies: PropTypes.array.isRequired,
    deaths: PropTypes.array.isRequired,
    startTime: PropTypes.number.isRequired,
  };

  state = {
    hover: null,
    xDomain: null,
    dragging: false,
  };

  render() {
    const {stagger, hp, maxHp, purifies, deaths, startTime} = this.props;
    const {xDomain} = this.state;
    return (
      <XYPlot height={400}
        className={'graph'}
        animation xDomain={xDomain && [xDomain.left, xDomain.right]}
        style={{
          fill: '#fff',
          stroke: '#fff',
        }}
        onMouseLeave={() => this.setState({ hover: null })}
        margin={{
          top: 30,
        }}
      >
        <DiscreteColorLegend
          orientation="horizontal"
          strokeWidth={2}
          items={[
            { title: 'Stagger', color: COLORS.stagger },
            { title: 'Purify', color: COLORS.purify },
            { title: 'Health', color: COLORS.hp },
            { title: 'Max Health', color: COLORS.maxHp },
            { title: 'Player Death', color: COLORS.death },
          ]}
        />
        <XAxis title="Time" tickFormat={value => formatDuration((value - startTime) / 1000)} />
        <YAxis title="Health" tickFormat={value => formatNumber(value)} />
        <AreaSeries
          data={hp}
          color={COLORS.hp}
          style={{strokeWidth: 2, fillOpacity: 0.2}}
        />
        <AreaSeries
          data={stagger}
          color={COLORS.stagger}
          style={{strokeWidth: 2, fillOpacity: 0.2}}
          onNearestX={d => this.setState({hover: d})}
          onSeriesMouseOut={() => this.setState({hover: null})}
        />
        <LineSeries
          data={maxHp}
          color={COLORS.maxHp}
          strokeWidth={2}
        />
        {deaths.map(({x}, idx) => (
          <VerticalLine
            key={`death-${idx}`}
            value={x}
            style={{
              line: { background: COLORS.death },
            }}
          />
        ))}
        {!this.state.dragging && this.state.hover && (
          <Crosshair
            className="tooltip-crosshair"
            values={[this.state.hover]}
            titleFormat={([ v ]) => ({ title: 'Stagger', value: formatNumber(v.y) })}
            itemsFormat={([ v ]) => {
              const entries = [
                { title: 'Health', value: `${formatNumber(v.hp)} / ${formatNumber(v.maxHp)}` },
              ];
              const purify = purifies.find(({x}) => Math.abs(x - v.x) < 500);
              if(purify) {
                entries.push({ title: 'Purified', value: formatNumber(purify.amount) });
              }
              return entries;
            }}
          />
        )}
        <Highlight
          enableY={false}
          onBrushStart={() => this.setState({dragging: true})}
          onBrushEnd={area => this.setState({xDomain: area, dragging: false})}
        />
        <MarkSeries
          data={purifies}
          color={COLORS.purify}
          onValueClick={d => this.setState({xDomain: { left: d.x - 10000, right: d.x + 10000 }})}
        />
      </XYPlot>
    );
  }
}

export default StaggerGraph;
