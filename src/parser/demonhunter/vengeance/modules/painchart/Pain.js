import React from 'react';
import PropTypes from 'prop-types';

import fetchWcl from 'common/fetchWclApi';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';
import ManaStyles from 'interface/others/ManaStyles';

import PainComponent from './PainComponent';
import PainChart from './PainChart';

class Pain extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      pain: null,
      bossHealth: null,
    };
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.reportCode !== this.props.reportCode || prevProps.actorId !== this.props.actorId || prevProps.start !== this.props.start || prevProps.end !== this.props.end) {
      this.load();
    }
  }

  load() {
    const { reportCode, actorId, start, end } = this.props;
    fetchWcl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceid: actorId,
      abilityid: 118,
    })
      .then(json => {
        this.setState({
          pain: json,
        });
      });

    fetchWcl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceclass: 'Boss',
      hostility: 1,
      abilityid: 1000,
    })
      .then(json => {
        this.setState({
          bossHealth: json,
        });
      });
  }

  get plot() {
    const { start, end } = this.props;

    const pain = this.state.pain.series[0].data.map(([timestamp, amount]) => {
      const x = Math.max(timestamp, start);
      return {
        x,
        y: amount / 10,
      };
    });

    const wasted = this.state.pain.series[0].events
      .filter(event => event.waste !== undefined)
      .map(({ timestamp, waste }) => ({ x: timestamp, y: waste }));

    const bossData = this.state.bossHealth.series.map((series, i) => {
      const data = series.data.map(([timestamp, health]) => ({ x: timestamp, y: health }));
      return {
        title: `${series.name} Health`,
        borderColor: ManaStyles[`Boss-${i}`].borderColor,
        backgroundColor: ManaStyles[`Boss-${i}`].backgroundColor,
        data,
      };
    });

    return (
      <PainChart
        pain={pain}
        wasted={wasted}
        bossData={bossData}
        startTime={start}
        endTime={end}
      />
    );
  }

  render() {
    if (!this.state.pain || !this.state.bossHealth) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    if(!this.state.pain.series[0]) {
      return (
        <div>
          This pain chart data from Warcraft Logs is corrupted and it cannot be parsed.
        </div>
      );
    }

    const { start } = this.props;
    const painBySecond = {
      0: 0,
    };
    this.state.pain.series[0].data.forEach((item) => {
      const secIntoFight = Math.floor((item[0] - start) / 1000);
      painBySecond[secIntoFight] = item[1];
    });

    const abilitiesAll = {};
    const categories = {
      generated: 'Pain Generators',
      spent: 'Pain Spenders',
    };

    let lastSecFight = start;
    this.state.pain.series[0].events.forEach((event) => {
      const secIntoFight = Math.floor((event.timestamp - start) / 1000);
      if (event.type === EventType.Cast) {
        const spell = SPELLS[event.ability.guid];
        if (!abilitiesAll[`${event.ability.guid}_spend`]) {
          abilitiesAll[`${event.ability.guid}_spend`] = {
            ability: {
              category: 'Pain Spenders',
              name: (spell === undefined) ? event.ability.name : spell.name,
              spellId: event.ability.guid,
            },
            spent: 0,
            casts: 0,
            created: 0,
            wasted: 0,
          };
        }
        abilitiesAll[`${event.ability.guid}_spend`].casts += 1;
        const lastPain = lastSecFight === secIntoFight ? painBySecond[lastSecFight - 1] : painBySecond[lastSecFight];
        const spendResource = spell !== undefined ? ((spell.painCost !== undefined) ? spell.painCost : (spell.max_pain < lastPain ? spell.max_pain : lastPain)) : 0;
        abilitiesAll[`${event.ability.guid}_spend`].spent += spendResource;
        abilitiesAll[`${event.ability.guid}_spend`].wasted += spell.max_pain !== undefined ? spell.max_pain - spendResource : 0;
      } else if (event.type === EventType.Energize) {
        if (!abilitiesAll[`${event.ability.guid}_gen`]) {
          const spell = SPELLS[event.ability.guid];
          abilitiesAll[`${event.ability.guid}_gen`] = {
            ability: {
              category: 'Pain Generators',
              name: (spell === undefined) ? event.ability.name : spell.name,
              spellId: event.ability.guid,
            },
            spent: 0,
            casts: 0,
            created: 0,
            wasted: 0,
          };
        }
        abilitiesAll[`${event.ability.guid}_gen`].casts += 1;
        abilitiesAll[`${event.ability.guid}_gen`].created += event.resourceChange;
        abilitiesAll[`${event.ability.guid}_gen`].wasted += event.waste;
      }
      if (secIntoFight !== lastSecFight) {
        lastSecFight = secIntoFight;
      }
    });

    const abilities = Object.keys(abilitiesAll).map(key => abilitiesAll[key]);
    abilities.sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created === b.created) {
        return 0;
      }
      return -1;
    });

    return (
      <>
        {this.plot}
        <PainComponent
          abilities={abilities}
          categories={categories}
        />
      </>
    );
  }
}

export default Pain;

