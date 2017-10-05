//Based on Main/Mana.js and Parser/VengeanceDemonHunter/Modules/PainChart

import React from 'react';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';
import PassiveFocusWasted from 'Parser/MarksmanshipHunter/Modules/FocusChart/PassiveFocusWasted';

import makeWclUrl from 'common/makeWclUrl';
import SPELLS from 'common/SPELLS';

import specialEventIndicators from 'Main/Chartist/specialEventIndicators';

import { formatDuration } from 'common/format';

import 'Main/Mana.css';

import FocusComponent from './FocusComponent';
import './Focus.css';


const passiveWasteThresholdPercentage = .03; // (wasted passive focus generated) / (total passive focus generated), anything higher will trigger "CAN BE IMPROVED"
//TODO: get a "real" number approved by a MMS expert

class Focus extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    playerHaste: PropTypes.number.isRequired,
    focusMax: PropTypes.number,
    passiveWaste: PropTypes.array,
    pWTracker : PropTypes.number,
    activeWaste: PropTypes.array,
    aWTracker: PropTypes.number,
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
    if (newProps.reportCode !== this.props.reportCode || this.props.focusMax !== this.props.focusMax || this.props.pWTracker !== this.props.pWTracker || this.props.aWTracker !== this.props.aWTracker || newProps.actorId !== this.props.actorId || newProps.start !== this.props.start || newProps.end !== this.props.end) {
      this.load(newProps.reportCode, newProps.actorId, newProps.start, newProps.end);
    }
  }
  load(reportCode, actorId, start, end) {

 
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

    return Promise.all([focusPromise, bossHealthPromise]);
  }

  render() {
        if (!this.state.focusData || !this.state.bossHealth || !this.props.passiveWaste) {
      return (
        <div>
          Loading...
        </div>
      );
    }

	const actorId = this.props.actorId;
  	const maxFocus = this.props.focusMax;
	const focusGen = Math.round((10 + .1 * this.props.playerHaste / 375)*100)/100; //TODO: replace constant passive FocusGen (right now we don't account for lust/hero or Trueshot)
    const { start, end } = this.props;
	let passiveCap = 0; //counts time focus capped (in seconds)
	let lastCatch = 0; //records the timestamp of the last event
  let cappedTimer = [];
	if (this.props.passiveWaste){
    cappedTimer = Array.from(this.props.passiveWaste);
    cappedTimer[0] = maxFocus;
  for (let i = 0; i < (this.props.end - this.props.start); i++){  //extrapolates focus given passive focus gain (TODO: Update for pulls with Volley)
    if (!cappedTimer[i]){
      if (cappedTimer[i - 1] === maxFocus){
        cappedTimer[i] = maxFocus;
      }
      else{ 
        cappedTimer[i] = cappedTimer[i-1] + focusGen/1000;
      }
    }
    if (cappedTimer[i] === maxFocus){
      passiveCap += 1/1000;
    }
  }



  }
	
	/* no, you aren't seeing double- this does the same thing as above, but aims to maximize range where-ever possible.
	This is the graph data- since the graph is just a general point of reference, and I only record 1 data point for
	every second, this ensures that the range of each section of the graph is accurate, at the cost of exact slope*/
	lastCatch = 0;
	let overCapBySecond = {};
  let focusBySecond = [];
  const magicGraphNumber = Math.floor(maxFocus / 2);
	this.state.focusData.series[0].data.forEach((item) => {
	  const secIntoFight = Math.floor((item[0] - start) / 1000);
	  if (focusBySecond[secIntoFight] && item[1] <= magicGraphNumber && focusBySecond[secIntoFight] > item[1]){ //aims to get highest peak
		 focusBySecond[secIntoFight] = item[1];
	  }
	  else if (focusBySecond[secIntoFight] && item[1] > magicGraphNumber && focusBySecond[secIntoFight] < item[1]){ //aims to get lowest valley
		 focusBySecond[secIntoFight] = item[1];
	  }
	  else if (!focusBySecond[secIntoFight]){
		  focusBySecond[secIntoFight] = item[1];
	  }
	  lastCatch = Math.floor((item[0] - start) / 1000);
	  if(item[1] > maxFocus - 1){
	  }
	});
	for (let i = 0; i < lastCatch; i++){ //extrapolates for passive focus gain
		if (!focusBySecond[i]){
			if (focusBySecond[i - 1] > maxFocus-focusGen){
				focusBySecond[i] = maxFocus;
			}
			else{
				focusBySecond[i] = focusBySecond[i-1]+ focusGen;
			}
		}
		if (focusBySecond[i] > maxFocus - 1){
			overCapBySecond[i] = focusGen;
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
      //spent: 'Focus Spenders', //I see no reason to display focus spenders, but leaving this in if someone later wants to add them
    };
    if(this.props.activeWaste){
      this.props.activeWaste.forEach((event) => {
      const secIntoFight = Math.floor((event.timestamp - start) / 1000);
      if (event.type === 'energize' && (event.sourceID === actorId)) {
        if (!abilitiesAll[`${event.ability.guid}_gen`]) {
          const spell = SPELLS[event.ability.guid];
          abilitiesAll[`${event.ability.guid}_gen`] = {
          ability: {
            category: 'Focus Generators',
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
        if (overCapBySecond[secIntoFight]){
          overCapBySecond[secIntoFight] += event.waste;
        }
        else{
          overCapBySecond[secIntoFight] = event.waste;
        }
        }
      });

    }

    const abilities = Object.keys(abilitiesAll).map(key => abilitiesAll[key]);
    abilities.sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created === b.created) {
        return 0;
      }
      return -1;
    });

    const fightDurationSec = Math.floor((end - start) / 1000);
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
	const wastedFocus = Math.round(passiveCap * focusGen);
	const totalFocus = Math.floor(fightDurationSec * focusGen);
	let passiveRating = "";
	if ( passiveCap / totalFocus > passiveWasteThresholdPercentage){
		passiveRating = "CAN BE IMPROVED";
	}
	else{
	}
	const totalWasted = [totalFocus,wastedFocus,passiveRating];

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
		      passive = {(totalWasted)}
        />
      </div>
    );

  }
}

export default Focus;
