import React from 'react';
import { AutoSizer } from 'react-virtualized';
import PropTypes from 'prop-types';
import BaseChart, { formatTime } from 'interface/others/BaseChart';

const COLORS = {
  MANA: {
    background: 'rgba(2, 109, 215, 0.25)',
    border: 'rgba(2, 109, 215, 0.6)',
  },
  HEALING: {
    background: 'rgba(2, 217, 110, 0.2)',
    border: 'rgba(2, 217, 110, 0.6)',
  },
  MANA_USED: {
    background: 'rgba(215, 2, 6, 0.4)',
    border: 'rgba(215, 2, 6, 0.6)',
  },
};

class ManaUsageGraph extends React.Component {
  static propTypes = {
    mana: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
    healing: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
    manaUsed: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
  };

  render() {
    const { mana, healing, manaUsed } = this.props;

    const baseEncoding = {
        x: {
          field: 'x',
          type: 'quantitative',
          axis: {
            labelExpr: formatTime('datum.value * 1000'),
            grid: false,
          },
          title: null,
          scale: { zero: true, nice: false },
        },
        y: {
          field: 'y',
          type: 'quantitative',
          title: null,
        },
      };

    const spec = {
      data: {
        name: 'combined',
      },
      mark: {
        type: 'area',
        line: {
          strokeWidth: 1,
        },
      },
      encoding: {
        ...baseEncoding,
        color: {
          field: 'kind',
          scale: {
            scheme: [COLORS.HEALING.border, COLORS.MANA.border, COLORS.MANA_USED.border],
          },
          title: null,
          legend: {
            orient: 'top',
          },
        },
      },
    };
    const data = {
      combined: [
        ...mana.map(e => ({...e, kind: 'Mana'})),
        ...healing.map(e => ({...e, kind: 'HPS'})),
        ...manaUsed.map(e => ({...e, kind: 'Mana Used'})),
      ],
    };

    return (
      <AutoSizer disableHeight>
        {({ width }) => (
        <BaseChart
          height={400}
          width={width}
          spec={spec}
          data={data}
          />
        )}
      </AutoSizer>
    );
  }
}

export default ManaUsageGraph;
