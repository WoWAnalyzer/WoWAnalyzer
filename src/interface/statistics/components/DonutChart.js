import React from 'react';
import PropTypes from 'prop-types';
import { RadialChart } from 'react-vis';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

class DonutChart extends React.PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      tooltip: PropTypes.string,
      spellId: PropTypes.number,
    })).isRequired,
    // While you could change the chart size, I strongly recommend you do not for consistency and to avoid breaking whenever this component is modified. Do you really need to adjust the size?
    chartSize: PropTypes.number,
    innerRadiusFactor: PropTypes.number,
  };
  static defaultProps = {
    chartSize: 90,
    innerRadiusFactor: 0.28,
  };

  renderLegend(items) {
    const total = items.reduce((sum, item) => sum + item.value, 0);

    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, spellId }, index) => {
      label = tooltip ? (
        <dfn data-tip={tooltip}>{label}</dfn>
      ) : label;
      label = spellId ? (
        <SpellLink id={spellId}>{label}</SpellLink>
      ) : label;
      return (
        <div
          className="flex"
          style={{
            marginBottom: ((numItems - 1) === index) ? 0 : 12,
          }}
          key={index}
        >
          <div className="flex-sub">
            <div
              style={{
                display: 'inline-block',
                background: color,
                borderRadius: '50%',
                width: 10,
                height: 10,
                marginBottom: -1,
              }}
            />
          </div>
          <div className="flex-main" style={{ paddingLeft: 5 }}>
            {label}
          </div>
          <div className="flex-sub">
            <dfn data-tip={value}>
              {formatPercentage(value / total, 0)}%
            </dfn>
          </div>
        </div>
      );
    });
  }
  renderChart(items, chartSize, innerRadiusFactor) {
    return (
      <RadialChart
        colorType="literal"
        data={items.map(item => ({
          ...item,
          angle: item.value,
        }))}
        width={chartSize}
        height={chartSize}
        radius={chartSize / 2 - 1} // a 1px padding avoids straight edges
        innerRadius={chartSize * innerRadiusFactor}
      />
    );
  }
  render() {
    const { items, chartSize, innerRadiusFactor } = this.props;

    return (
      <div className="flex">
        <div className="flex-main" style={{ fontSize: '85%' }}>
          {this.renderLegend(items)}
        </div>
        <div className="flex-sub" style={{ paddingLeft: 15 }}>
          {this.renderChart(items, chartSize, innerRadiusFactor)}
        </div>
      </div>
    );
  }
}

export default DonutChart;
