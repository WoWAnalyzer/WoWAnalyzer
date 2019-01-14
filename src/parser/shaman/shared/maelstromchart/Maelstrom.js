//Based on Main/Mana.js and parser/VengeanceDemonHunter/Modules/PainChart
//Note: For those that might wish to add Boss Health in the future- some of the work is already done here: https://github.com/leapis/WoWAnalyzer/tree/focusChartBossHealth

import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexibleWidthXYPlot as XYPlot,
  DiscreteColorLegend,
  XAxis,
  YAxis,
  AreaSeries,
  LineSeries,
  VerticalGridLines,
  HorizontalGridLines,
} from 'react-vis';
import SPELLS from 'common/SPELLS';

import { formatDuration } from 'common/format';

import MaelstromComponent from './MaelstromComponent';
import './Maelstrom.scss';

const COLORS = {
  MAELSTROM_FILL: 'rgba(0, 139, 215, 0.2)',
  MAELSTROM_BORDER: 'rgba(0, 145, 255, 1)',
  WASTED_MAELSTROM_FILL: 'rgba(255, 20, 147, 0.3)',
  WASTED_MAELSTROM_BORDER: 'rgba(255, 90, 160, 1)',
};

class Maelstrom extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    maelstromMax: PropTypes.number,
    maelstromPerSecond: PropTypes.array,
    tracker: PropTypes.number,
    activeMaelstromGenerated: PropTypes.object,
    activeMaelstromWasted: PropTypes.object,
    generatorCasts: PropTypes.object,
    activeMaelstromWastedTimeline: PropTypes.object,
  };

  get plot() {
    const { start, end, maelstromMax, maelstromPerSecond, activeMaelstromWastedTimeline } = this.props;

    // (by Chizu): I'm scared to touch what's underneath, someone rework this please

    //not it's own module since it's "fake data" meant to look visually accurate, not be numerically accurate
    let lastCatch = 0; //records the timestamp of the last event
    const overCapBySecond = [];
    const maelstromBySecond = [];
    const magicGraphNumber = Math.floor(maelstromMax / 2);
    let passiveWasteIndex = 0;
    if (maelstromPerSecond && activeMaelstromWastedTimeline) {
      maelstromPerSecond.forEach(item => {
        const secIntoFight = Math.floor(passiveWasteIndex / 1000);
        if (Math.max(maelstromBySecond[secIntoFight], item) >= magicGraphNumber) { //aims to get highest peak
          maelstromBySecond[secIntoFight] = Math.max(maelstromBySecond[secIntoFight], item);
        } else if (Math.max(maelstromBySecond[secIntoFight], item) < magicGraphNumber) { //aims to get lowest valley
          maelstromBySecond[secIntoFight] = Math.min(maelstromBySecond[secIntoFight], item);
        } else if (!maelstromBySecond[secIntoFight]) {
          maelstromBySecond[secIntoFight] = item;
        }
        lastCatch = Math.floor(passiveWasteIndex / 1000);
        passiveWasteIndex++;
      });
    }

    for (let i = 0; i < lastCatch; i++) {
      if (!maelstromBySecond[i]) {
        if (maelstromBySecond[i - 1] > maelstromMax) {
          maelstromBySecond[i] = maelstromMax;
        } else {
          maelstromBySecond[i] = maelstromBySecond[i - 1];
        }
      }

      if (activeMaelstromWastedTimeline[i] && maelstromBySecond[i] + activeMaelstromWastedTimeline[i] > maelstromMax) {
        overCapBySecond[i] = (maelstromBySecond[i] + activeMaelstromWastedTimeline[i]) - maelstromMax;
      } else {
        overCapBySecond[i] = 0;
      }
    }

    const fightDurationSec = Math.floor((end - start) / 1000);
    for (let i = 0; i <= fightDurationSec; i++) {
      maelstromBySecond[i] = maelstromBySecond[i] !== undefined ? maelstromBySecond[i] : null;
      if (maelstromBySecond[i] !== null) {
        maelstromBySecond[i] = maelstromBySecond[i] > 0 ? maelstromBySecond[i] : 0;
      }
      overCapBySecond[i] = overCapBySecond[i] !== undefined ? overCapBySecond[i] : null;
    }

    // transform the weird data to a format react-vis uses
    const transformedMaelstrom = Object.entries(maelstromBySecond).map(([key, value]) => ({ x: Number(key), y: value }));
    const transformedWaste = Object.entries(overCapBySecond).map(([key, value]) => ({ x: Number(key), y: value }));
    return (
      <XYPlot
        height={400}
        yDomain={[0, maelstromMax]}
        margin={{
          top: 30,
        }}
      >
        <DiscreteColorLegend
          orientation="horizontal"
          strokeWidth={2}
          items={[
            { title: 'Maelstrom', color: COLORS.MAELSTROM_BORDER },
            { title: 'Wasted Maelstrom', color: COLORS.WASTED_MAELSTROM_BORDER },
          ]}
          style={{
            position: 'absolute',
            top: '-15px',
            left: '40%',
          }}
        />
        <XAxis title="Time" tickFormat={value => formatDuration(value)} />
        <YAxis title="Maelstrom" />
        <VerticalGridLines
          tickValues={transformedMaelstrom.filter(p => p.x % 30 === 0).map(p => p.x)}
          style={{
            strokeDasharray: 3,
            stroke: 'white',
          }}
        />
        <HorizontalGridLines
          tickValues={[30, 60, 90, maelstromMax]}
          style={{
            strokeDasharray: 3,
            stroke: 'white',
          }}
        />
        <AreaSeries
          data={transformedMaelstrom}
          color={COLORS.MAELSTROM_FILL}
          stroke="transparent"
        />
        <LineSeries
          data={transformedMaelstrom}
          color={COLORS.MAELSTROM_BORDER}
        />
        <AreaSeries
          data={transformedWaste}
          color={COLORS.WASTED_MAELSTROM_FILL}
          stroke="transparent"
        />
        <LineSeries
          data={transformedWaste}
          color={COLORS.WASTED_MAELSTROM_BORDER}
        />
      </XYPlot>
    );
  }

  render() {
    if (!this.props.tracker) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const { generatorCasts, activeMaelstromWasted, activeMaelstromGenerated } = this.props;

    const abilitiesAll = {};
    const categories = {
      generated: 'Maelstrom Generators',
      //spent: 'Focus Spenders', //I see no reason to display focus spenders, but leaving this in if someone later wants to add them
    };
    if (generatorCasts && activeMaelstromWasted && activeMaelstromGenerated) {
      Object.keys(generatorCasts).forEach((generator) => {
        const spell = SPELLS[generator];
        abilitiesAll[`${generator}_gen`] = {
          ability: {
            category: 'Maelstrom Generators',
            name: spell.name,
            spellId: Number(generator),
          },
          casts: generatorCasts[generator],
          created: activeMaelstromGenerated[generator],
          wasted: activeMaelstromWasted[generator],
        };

      });
    }

    const abilities = Object.keys(abilitiesAll).map(key => abilitiesAll[key]);
    abilities.sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      }
      if (a.created === b.created) {
        return 0;
      }
      return -1;
    });

    return (
      <div>
        {this.plot}
        <MaelstromComponent
          abilities={abilities}
          categories={categories}
        />
      </div>
    );
  }
}

export default Maelstrom;
