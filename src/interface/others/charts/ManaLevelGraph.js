import React from 'react';
import { VegaLite } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import PropTypes from 'prop-types';
import { formatTime, defaultConfig } from 'interface/others/FooterChart';

class ManaLevelGraph extends React.PureComponent {
  static propTypes = {
    mana: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
    deaths: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
    })),
    bossData: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      borderColor: PropTypes.string.isRequired,
      backgroundColor: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      })).isRequired,
    })).isRequired,
  };

  static defaultProps = {
    deaths: [],
  };

  colors = {
    mana: {
      border: 'rgba(2, 109, 215, 0.6)',
      background: 'rgba(2, 109, 215, 0.25)',
    },
    death: 'rgba(255, 0, 0, 0.8)',
  };

  render() {
    const { mana, deaths, bossData } = this.props;

    const baseEncoding = {
            x: {
              field: 'x',
              type: 'quantitative',
              axis: {
                labelExpr: formatTime('datum.value'),
                grid: false,
              },
              title: null,
              scale: { zero: true },
            },
            y: {
              field: 'y',
              type: 'quantitative',
              axis: {
                tickCount: 4,
              },
              title: null,
            },
          };

    const spec = {
      layer: [
        {
          data: {
            name: 'mana',
          },
          mark: {
            type: 'area',
            line: {
              interpolate: 'linear',
              color: this.colors.mana.border,
              strokeWidth: 1,
            },
            color: this.colors.mana.background,
          },
          encoding: baseEncoding,
        },
        {
          data: {
            name: 'bosses',
          },
          transform: [
            { flatten: ['data'] },
            { calculate: 'datum.data.x', as: 'x' },
            { calculate: 'datum.data.y', as: 'y' },
          ],
          mark: {
            type: 'area',
            opacity: 0.6,
            line: {
              interpolate: 'linear',
              strokeWidth: 1,
            },
          },
          encoding: {
            ...baseEncoding,
            color: {
              field: 'title',
              type: 'nominal',
              title: 'Enemy',
              legend: {
                orient: 'top',
              },
              scale: {
                scheme: "accent",
              },
            },
          },
        },
        {
          data: {
            name: 'deaths',
          },
          mark: {
            type: 'rule',
            color: 'red',
            strokeWidth: 2,
          },
          encoding: {
            x: baseEncoding.x,
            tooltip: [
              { field: 'name', type: 'nominal', title: 'Target' },
              { field: 'ability', type: 'nominal', title: 'Killing Ability' },
            ],
          },
        },
      ],
    };

    const data = {
      mana, deaths,
      bosses: bossData,
    };

    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <VegaLite
            height={400}
            width={width}
            config={defaultConfig}
            spec={spec}
            data={data}
            actions={false}
            theme="dark"
            tooltip={{theme: 'dark'}}
          />
        )}
      </AutoSizer>
    );
  }
}
export default ManaLevelGraph;
