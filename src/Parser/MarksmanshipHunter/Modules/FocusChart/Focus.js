// Based on ??? which was based on Main/Mana.js

import React from 'react';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';

import makeWclUrl from 'common/makeWclUrl';
import SPELLS from 'common/SPELLS';

import specialEventIndicators from 'Main/Chartist/specialEventIndicators';

import 'Main/Mana.css';

import FocusComponent from './FocusComponent';
import './Focus.css';
const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

class Focus extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  };
  constructor() {
    super();
    this.state = {
      focusData: null,
      bossHealth: null,
    };
	
  }
  

  componentWillMount() {
    this.load(this.props.reportCode, this.props.actorId, this.props.start, this.props.end);
  }
  componentWillReceiveProps(newProps) {
    if (newProps.reportCode !== this.props.reportCode || newProps.actorId !== this.props.actorId || newProps.start !== this.props.start || newProps.end !== this.props.end) {
      this.load(newProps.reportCode, newProps.actorId, newProps.start, newProps.end);
    }
  }
  load(reportCode, actorId, start, end) {
	  var firstEvent = start + 1;
    const focusPromise = fetch(makeWclUrl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceid: actorId,
      abilityid: 102,
    }))
      .then(response => response.json())
      .then((json) => {
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            focusData: json,
          });
        }
      });
	const playerPromise = fetch(makeWclUrl(`report/events/${reportCode}`, {
      start,
      end: firstEvent,
      actorid: actorId,
    }))
      .then(response => response.json())
      .then((json) => {
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            playerData: json,
          });
        }
      });	
    const bossHealthPromise = fetch(makeWclUrl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceclass: 'Boss',
      hostility: 1,
      abilityid: 1000,
    }))
      .then(response => response.json())
      .then((json) => {
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            bossHealth: json,
          });
        }
      });

    return Promise.all([focusPromise, bossHealthPromise, playerPromise]);
  }

  render() {
    if (!this.state.focusData || !this.state.bossHealth || !this.state.playerData) {
      return (
        <div>
          Loading...
        </div>
      );
    }
	
	const focusGen = 10 + this.state.playerData.events[0].hasteRanged / 4000;
	
    const { start, end } = this.props;
	var passiveCap = 0;
	var lastCatch = 0;
	
    const cappedTimer = {
      0: 130,
    };
    this.state.focusData.series[0].data.forEach((item) => {
      const secIntoFight = (item[0] - start);
		 cappedTimer[secIntoFight] = item[1];
		 lastCatch = (item[0] - start);
    });
	for (var i = 0; i < (lastCatch); i++){
		if (!cappedTimer[i]){
			if (cappedTimer[i] === 130){
				cappedTimer[i] = 130;
			}
			else{
				cappedTimer[i] = cappedTimer[i-1]+ focusGen/1000;
			}
		}
		if (cappedTimer[i] > 129.999999){
			passiveCap += 1/1000;
		}
	}
	
	var lastCatch = 0;
    const focusBySecond = {
      0: 130,
    };
	this.state.focusData.series[0].data.forEach((item) => {
	  const secIntoFight = Math.floor((item[0] - start) / 1000); //weighted
	  if (focusBySecond[secIntoFight] && item[1] <= 65 && focusBySecond[secIntoFight] > item[1]){
		 focusBySecond[secIntoFight] = item[1];
	  }
	  else if (focusBySecond[secIntoFight] && item[1] > 65 &&focusBySecond[secIntoFight] < item[1]){
		 focusBySecond[secIntoFight] = item[1];
	  }
	  else if (!focusBySecond[secIntoFight]){
		  focusBySecond[secIntoFight] = item[1];
	  }
	  lastCatch = Math.floor((item[0] - start) / 1000);
	  if(item[1] > 129){
	  }
	});
	for (var i = 0; i < lastCatch; i++){
		if (!focusBySecond[i]){
			if (focusBySecond[i] > 130-focusGen){
				focusBySecond[i] = 130;
			}
			else{
				focusBySecond[i] = focusBySecond[i-1]+ focusGen - 3*.67;
			}
		}
		if (focusBySecond[i] > 129){
			//passiveCap ++;
		}
	}
		
    const bosses = [];
    const deadBosses = [];
    this.state.bossHealth.series.forEach((series) => {
      const newSeries = {
        ...series,
        data: {},
      };

      series.data.forEach((item) => {
        const secIntoFight = Math.floor((item[0] - start) / 1000);

        if (deadBosses.indexOf(series.guid) === -1) {
          const health = item[1];
          newSeries.data[secIntoFight] = health;

          if (health === 0) {
            deadBosses.push(series.guid);
          }
        }
      });
      bosses.push(newSeries);
    });
    const deathsBySecond = {};
    this.state.focusData.deaths.forEach((death) => {
      const secIntoFight = Math.floor((death.timestamp - start) / 1000);

      if (death.targetIsFriendly) {
        deathsBySecond[secIntoFight] = true;
      }
    });


    const abilitiesAll = {};
    const categories = {
      generated: 'Focus Generators',
      spent: 'Focus Spenders',
    };

    const overCapBySecond = {};
    let lastOverCap;
    let lastSecFight = start;
    this.state.focusData.series[0].events.forEach((event) => {
		const secIntoFight = Math.floor((event.timestamp - start) / 1000);
		if (event.type === 'energize') {
			if (!abilitiesAll[`${event.ability.guid}_gen`]) {
			  const spell = SPELLS[event.ability.guid];
			  var tempSpellID = event.ability.guid;
			  if(tempSpellID == 187675 || tempSpellID == 215107){
				tempSpellID = 185358;
			  }
			  else if(tempSpellID == 213363){
				tempSpellID = 2643;
			  }
			  abilitiesAll[`${event.ability.guid}_gen`] = {
				ability: {
				  category: 'Focus Generators',
				  name: (spell === undefined) ? event.ability.name : spell.name,
				  spellId: tempSpellID,
				},
				spent: 0,
				casts: 0,
				created: 0,
				wasted: 0,
			  };
			}
			abilitiesAll[`${event.ability.guid}_gen`].casts += 1;
			abilitiesAll[`${event.ability.guid}_gen`].created += event.resourceChange;
			
		  }
	  /*
      if (event.type === 'cast') {
        const spell = SPELLS[event.ability.guid];
					  
        if (!abilitiesAll[`${event.ability.guid}_spend`]) {

          abilitiesAll[`${event.ability.guid}_spend`] = {
			  
            ability: {
              category: 'Focus Spenders',
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
        const lastFocus = lastSecFight === secIntoFight ? focusBySecond[lastSecFight - 1] : focusBySecond[lastSecFight];
        const spendResource = (spell.focusCost !== undefined) ? spell.focusCost : (spell.max_focus < lastFocus ? spell.max_focus : lastFocus);
        abilitiesAll[`${event.ability.guid}_spend`].spent += spendResource;
        abilitiesAll[`${event.ability.guid}_spend`].wasted += spell.max_focus ? spell.max_focus - spendResource : 0;
      } else if (event.type === 'energize') {
		  if(event.waste > 0){
			  console.log("wasted at:" + event.timestamp);
		  }
        if (!abilitiesAll[`${event.ability.guid}_gen`]) {
          const spell = SPELLS[event.ability.guid];
		  var tempSpellID = event.ability.guid;
		  if(tempSpellID == 187675 || tempSpellID == 215107){
			tempSpellID = 185358;
		  }
		  else if(tempSpellID == 213363){
			  console.log("yo: " + event.timestamp);
			tempSpellID = 2643;
		  }
          abilitiesAll[`${event.ability.guid}_gen`] = {
            ability: {
              category: 'Focus Generators',
              name: (spell === undefined) ? event.ability.name : spell.name,
              spellId: tempSpellID,
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
	  */
      if (secIntoFight !== lastSecFight) {
        lastSecFight = secIntoFight;
      }
    });
	const totalWasted = passiveCap;
    const abilities = Object.keys(abilitiesAll).map(key => abilitiesAll[key]);
    abilities.sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created === b.created) {
        return 0;
      }
      return -1;
    });

    const fightDurationSec = Math.ceil((end - start) / 1000);
    const labels = [];
    for (let i = 0; i <= fightDurationSec; i += 1) {
      labels.push(i);

      focusBySecond[i] = focusBySecond[i] !== undefined ? focusBySecond[i] : null;
      overCapBySecond[i] = overCapBySecond[i] !== undefined ? overCapBySecond[i] : null;
      bosses.forEach((series) => {
        series.data[i] = series.data[i] !== undefined ? series.data[i] : null;
      });
      deathsBySecond[i] = deathsBySecond[i] !== undefined ? deathsBySecond[i] : undefined;
    }

    const chartData = {
      labels,
      series: [
        ...bosses.map((series, index) => ({
          className: `boss-health boss-${index} boss-${series.guid}`,
          name: `${series.name} Health`,
          data: Object.keys(series.data).map(key => series.data[key]),
        })),
        {
          className: 'pain',
          name: 'Focus',
          data: Object.keys(focusBySecond).map(key => focusBySecond[key] / 1),
        },
        {
          className: 'wasted',
          name: 'Focus wasted',
          data: Object.keys(overCapBySecond).map(key => overCapBySecond[key]),
        },
      ],
    };
    let step = 0;

    return (
      <div>
	  {(totalWasted)}
        <ChartistGraph
          data={chartData}
          options={{
            low: 0,
            high: 125,
            showArea: true,
            showPoint: false,
            fullWidth: true,
            height: '300px',
            lineSmooth: Chartist.Interpolation.simple({
              fillHoles: true,
            }),
            axisX: {
              labelInterpolationFnc: function skipLabels(seconds) {
                if (seconds < ((step - 1) * 30)) {
                  step = 0;
                }
                if (step === 0 || seconds >= (step * 30)) {
                  step += 1;
                  return formatDuration(seconds);
                }
                return null;
              },
              offset: 20,
            },
            axisY: {
              onlyInteger: true,
              offset: 35,
              labelInterpolationFnc: function skipLabels(percentage) {
                return `${percentage}`;
              },
            },
            plugins: [
              Chartist.plugins.legend({
                classNames: [
                  ...bosses.map((series, index) => `boss-health boss-${index} boss-${series.guid}`),
                  'pain',
                  'wasted',
                ],
              }),
              specialEventIndicators({
                series: ['death'],
              }),
            ],
          }}
          type="Line"
        />
        <FocusComponent
          abilities={abilities}
          categories={categories}
        />
      </div>
    );
  }
}

export default Focus;
