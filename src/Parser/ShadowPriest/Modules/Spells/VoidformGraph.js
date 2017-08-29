import React from 'react';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';

import 'chartist-plugin-legend';

import './VoidformsTab.css';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};



const MAX_MINDBENDER_MS = 21500;
// changing this value will have a large impact on webbrowser performance. About 200 seems to be best of 2 worlds.
const RESOLUTION_MS = 200;
const TIMESTAMP_ERROR_MARGIN = 500;
const NORMAL_VOIDFORM_MS_THRESHOLD = 70000;
const SURRENDER_TO_MADNESS_VOIDFORM_MS_THRESHOLD = 150000;

// current insanity formula:
// d = 6 + (2/3)*x
// where d = total drain of Insanity over 1 second 
// max insanity is 10000 (100 ingame)
const INSANITY_DRAIN_INCREASE = 66.67;


const T20_4P_DECREASE_DRAIN_MODIFIER_NORMAL = 0.9;
const T20_4P_DECREASE_DRAIN_MODIFIER_SURRENDER_TO_MADNESS = 0.95;

const VoidformGraph = ({ 
    lingeringInsanityStacks, 
    mindbenderEvents, 
    voidTorrentEvents, 
    dispersionEvents,
    insanityEvents,
    surrenderToMadness=false,
    setT20P4=false,
    fightEnd, 
    ...voidform
}) => {
    // todo: change ended to end on Voidform for consistency;

    const voidFormEnd = voidform.ended === undefined ? fightEnd : voidform.ended;
    const includesEndOfFight = voidform.ended === undefined || fightEnd <= voidform.ended + TIMESTAMP_ERROR_MARGIN;

    const MAX_TIME_IN_VOIDFORM = surrenderToMadness ? SURRENDER_TO_MADNESS_VOIDFORM_MS_THRESHOLD : NORMAL_VOIDFORM_MS_THRESHOLD;

    const labels = [];

    const stacksData = [];
    const insanityData = [];
    const insanityGeneratedData = [];
    const insanityDrain = [];
    const initialInsanity = insanityEvents.length > 0 ? insanityEvents[0].classResources[0].amount - insanityEvents[0].resourceChange * 100 : 7000;


    const lingeringInsanityData = [];
    const mindbenderData = [];
    const voidTorrentData = [];
    const dispersionData = [];

    const endOfVoidformData = [];
    const endData = [];

    const INSANITY_DRAIN_MODIFIER = setT20P4 ? 
      (surrenderToMadness ? 
        T20_4P_DECREASE_DRAIN_MODIFIER_SURRENDER_TO_MADNESS :
        T20_4P_DECREASE_DRAIN_MODIFIER_NORMAL) 
      : 1;

    const INSANITY_DRAIN_START = 600 * INSANITY_DRAIN_MODIFIER;
    const INSANITY_DRAIN_INCREASE_BY_SECOND = Math.round(INSANITY_DRAIN_INCREASE * INSANITY_DRAIN_MODIFIER);


    const atLabel = (timestamp) => {
      return Math.floor((timestamp - voidform.start)/RESOLUTION_MS);
    };

    const voidFormIsOver = (i) => {
      return voidform.start + i * RESOLUTION_MS >= voidform.ended;
    };

    const fillData = (array, eventStart, eventEnd, data=false) => {
      const amountOfSteps = Math.round((eventEnd - eventStart)/RESOLUTION_MS);
      const startStep = atLabel(eventStart);
      for(let i = 0; i < amountOfSteps; i++){
        if(eventStart + i * RESOLUTION_MS >= voidform.ended) break;
        array[startStep+i] = data ? data : stacksData[startStep+i];
      }
    };



    const steps = MAX_TIME_IN_VOIDFORM / RESOLUTION_MS;
    for (let i = 0; i < steps; i += 1) {
      labels[i] = i;

      stacksData[i]             = null;
      lingeringInsanityData[i]  = null;
      insanityData[i]           = null;
      insanityGeneratedData[i]  = null;

      mindbenderData[i]         = null;
      voidTorrentData[i]        = null;
      dispersionData[i]         = null;
      endData[i]                = null;
      endOfVoidformData[i]      = null;
    }

    voidform.stacks.forEach(({stack, timestamp}) => {
      fillData(stacksData, timestamp, timestamp+1000, stack);
    });

    // fill in dispersion gaps & 100s+ voidforms:
    for (let i = 0; i <= steps; i++){
      if(stacksData[i] === null && (i * RESOLUTION_MS) + voidform.start < voidform.ended) stacksData[i] = stacksData[i-1];
    }

    endOfVoidformData[atLabel(voidform.ended)+1] = 100;
    endOfVoidformData[atLabel(voidform.ended)]   = 100;


    if(lingeringInsanityStacks.length > 0) lingeringInsanityData[0] = lingeringInsanityStacks[0].stack + 2;
    lingeringInsanityStacks.forEach(lingering => lingeringInsanityData[atLabel(lingering.timestamp)] = lingering.stack);

    dispersionEvents.filter(dispersion => dispersion.start >= voidform.start && dispersion.end <= voidFormEnd + TIMESTAMP_ERROR_MARGIN).forEach(dispersion => fillData(dispersionData, dispersion.start, dispersion.end));
    mindbenderEvents.filter(mindbender => mindbender.start >= voidform.start && mindbender.end <= voidFormEnd + MAX_MINDBENDER_MS).forEach(mindbender => fillData(mindbenderData, mindbender.start, mindbender.end));
    voidTorrentEvents.filter(voidTorrent => voidTorrent.start >= voidform.start && voidTorrent.end <= voidFormEnd + TIMESTAMP_ERROR_MARGIN).forEach(voidTorrent => fillData(voidTorrentData, voidTorrent.start, voidTorrent.end));

    let currentDrain = INSANITY_DRAIN_START;
    for(let i = 0; i < steps; i++){
      // set drain to 0 if voidform ended:
      if(voidFormIsOver(i)){
        currentDrain = 0;
        break;
      }

      // dont increase if dispersion/voidtorrent is active:
      if(dispersionData[i] === null && voidTorrentData[i] === null){
        currentDrain += INSANITY_DRAIN_INCREASE_BY_SECOND * RESOLUTION_MS/1000;
      }

      insanityDrain[i] = currentDrain;
    }


    let totalInsanityGenerated = 0;
    insanityEvents.forEach(event => {
      let addInsanity = 0;
      // sometimes mindflay gives negative resourceChange for some unknown reason (adding this fix corrected the graphs).
      if(event.resourceChange < 0){
        addInsanity = event.resourceChange * -1 * 100;
      } else {
        const insanityGain = event.resourceChange - event.waste;
        addInsanity = insanityGain > 0 ? insanityGain * 100 : 0;
      }

      totalInsanityGenerated += addInsanity;
      if(insanityGeneratedData[atLabel(event.timestamp)] === null){
        insanityGeneratedData[atLabel(event.timestamp)] = totalInsanityGenerated;
      } else {
        // if 2 events occured on same label:
        insanityGeneratedData[atLabel(event.timestamp)] += addInsanity;
      }
      
    });


    let currentInsanity       = initialInsanity;
    let totalInsanityDrained  = 0;
    let lastestInsanityGenerated = 0;
    for(let i = 0; i < steps; i++){
      if(insanityGeneratedData[i] !== null) lastestInsanityGenerated = insanityGeneratedData[i];

      // Increase drain if dispersion/voidtorrent isnt active:
      if(dispersionData[i] === null && voidTorrentData[i] === null){
        currentInsanity = insanityDrain[i] * RESOLUTION_MS/1000 + lastestInsanityGenerated - totalInsanityDrained + initialInsanity;

        totalInsanityDrained += insanityDrain[i] * RESOLUTION_MS/1000;
      } else {
        currentInsanity = lastestInsanityGenerated - totalInsanityDrained + initialInsanity;
      }
      

      insanityData[i] = voidFormIsOver(i) ? 0 : (currentInsanity > 0 ? currentInsanity/100 : 0);
    }


    
    let legends = {
      classNames: [
        'stacks',
        'insanity',
        // 'insanityDrain',
        'voidtorrent',
        'mindbender',
        'dispersion',
        'endOfVoidform',
      ],
    };

    let chartData = {
      labels: labels,
      series: [
        

        {
          className: 'stacks',
          name: 'Stacks',
          data: Object.keys(stacksData).map(key => stacksData[key]).slice(0, steps),
        },
        {
          className: 'insanity',
          name: 'Insanity',
          data: Object.keys(insanityData).map(key => insanityData[key]).slice(0, steps),
        },

        {
          className: 'voidtorrent',
          name: 'Void Torrent',
          data: Object.keys(voidTorrentData).map(key => voidTorrentData[key]).slice(0, steps),
        },
        // {
        //   className: 'insanityDrain',
        //   name: 'InsanityDrain',
        //   data: Object.keys(insanityDrain).map(key => insanityDrain[key]/100).slice(0, steps),
        // },
        {
          className: 'mindbender',
          name: 'Mindbender',
          data: Object.keys(mindbenderData).map(key => mindbenderData[key]).slice(0, steps),
        },
        

        {
          className: 'dispersion',
          name: 'Dispersion',
          data: Object.keys(dispersionData).map(key => dispersionData[key]).slice(0, steps),
        },

        
        {
          className: 'endOfVoidform',
          name: 'End of Voidform',
          data: Object.keys(endOfVoidformData).map(key => endOfVoidformData[key]).slice(0, steps),
        },
      ],
    };

    if(lingeringInsanityStacks.length > 0){
      chartData = {
        ...chartData,
        series: [
          {
            className: 'lingeringInsanity',
            name: 'Lingering Insanity',
            data: Object.keys(lingeringInsanityData).map(key => lingeringInsanityData[key]).slice(0, steps),
          },

          ...chartData.series,
        ],
      };

      legends = {
        ...legends,
        classNames: [
          'lingeringInsanity',
          ...legends.classNames,
        ],
      };

    }

    if(includesEndOfFight){
      const fightEndedAtSecond = atLabel(fightEnd);
      endData[fightEndedAtSecond-1] = 100;
      endData[fightEndedAtSecond]   = 100;

      chartData = {
        ...chartData,
        series: [
          ...chartData.series,
          {
            className: 'endOfFight',
            name: 'End of Fight',
            data: Object.keys(endData).map(key => endData[key]).slice(0, steps),
          },
        ],
      };

      legends = {
        ...legends,
        classNames: [
          ...legends.classNames,
          'endOfFight',
        ],
      };
    }

    return (<ChartistGraph
      data={chartData}
      
      options={{
        low: 0,
        high: 100,
        series: {
          'Stacks': {
            lineSmooth: Chartist.Interpolation.none({
              fillHoles: true,
            }),
            showPoint: false,
          },
          // 'insanityDrain': {
          //   lineSmooth: Chartist.Interpolation.none({
          //     fillHoles: true,
          //   }),
          //   showPoint: false,
          //   show: false,
          // },
          'Insanity': {
            lineSmooth: Chartist.Interpolation.none({
              fillHoles: true,
            }),
            showPoint: false,
          },
          'Mindbender': {
            showArea: true,
            lineSmooth: Chartist.Interpolation.none({
              fillHoles: true,
            }),
          },
          'Void Torrent': {
            showArea: true,
          },
          'Dispersion': {
            showArea: true,
            // lineSmooth: Chartist.Interpolation.step({
            //   fillHoles: true,
            // }),
          },
          'Lingering Insanity': {
            showArea: true,
            lineSmooth: Chartist.Interpolation.none({
              fillHoles: true,
            }),
          },
          'End of Fight': {
            showArea: true,
          },
          'End of Voidform': {
            showArea: true,
          },
        },
        fullWidth: true,
        height: '200px',
        axisX: {
          labelInterpolationFnc: function skipLabels(ms) {
            const everySecond = surrenderToMadness ? 10 : 5;
            return (ms*(RESOLUTION_MS/1000))%everySecond===0 ? formatDuration(ms*(RESOLUTION_MS/1000)) : null;
          },
          offset: 30,
        },
        axisY: {
          onlyInteger: true,
          offset: 50,
          labelInterpolationFnc: function skipLabels(numberOfStacks) {
            return numberOfStacks;
          },
        },
        plugins: [
          Chartist.plugins.legend(legends),
        ],
      }}
      type="Line"
    />);
};

VoidformGraph.propTypes = {
  fightEnd: PropTypes.number,
  lingeringInsanityStacks: PropTypes.array,
  insanityEvents: PropTypes.array,
  mindbenderEvents: PropTypes.array,
  voidTorrentEvents: PropTypes.array,
  dispersionEvents: PropTypes.array,
  surrenderToMadness: PropTypes.bool,
  setT20P4: PropTypes.bool.isRequired,
};

export default VoidformGraph;