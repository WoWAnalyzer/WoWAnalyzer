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

// const timeAsSeconds = (time) => time/1000;
// const timeAsInteger = (time) => Math.floor(time/1000);



const MAX_MINDBENDER_MS = 21500;
const RESOLUTION_MS = 100;
const TIMESTAMP_ERROR_MARGIN = 500;
const NORMAL_VOIDFORM_MS_THRESHOLD = 70000;
const SURRENDER_TO_MADNESS_VOIDFORM_MS_THRESHOLD = 150000;

const INSANITY_DRAIN_MS_START = 1.8;



const VoidformGraph = ({
    start, 
    ended, 
    stacks, 
    lingeringInsanityStacks, 
    fightEnd, 
    mindbenders, 
    voidTorrents, 
    dispersions,
    insanity,
    surrenderToMadness=false,
}) => {
    const voidFormEnd = ended === undefined ? fightEnd : ended;
    const includesEndOfFight = ended === undefined || fightEnd <= ended + TIMESTAMP_ERROR_MARGIN;

    const MAX_TIME_IN_VOIDFORM = surrenderToMadness ? SURRENDER_TO_MADNESS_VOIDFORM_MS_THRESHOLD : NORMAL_VOIDFORM_MS_THRESHOLD;

    // const mindbendersInCurrent   = ;
    // const voidTorrentsInCurrent  = ;
    // const dispersionsInCurrent   = ;

    const labels = [];
    const stacksData = [];
    const lingeringInsanityData = [];
    const insanityData = [];
    const mindbenderData = [];
    const voidTorrentData = [];
    const dispersionData = [];
    const endData = [];
    const endOfVoidformData = [];

    const atLabel = (timestamp) => {
      return Math.floor((timestamp - start)/RESOLUTION_MS);
    }

    const fillData = (array, eventStart, eventEnd, data=false) => {
      const amountOfSteps = Math.floor((eventEnd - eventStart)/RESOLUTION_MS);
      const startStep = atLabel(eventStart);
      for(let i = 0; i < amountOfSteps; i++){
        array[startStep+i] = data ? data : stacksData[startStep+i];
      }
    }

    const steps = MAX_TIME_IN_VOIDFORM / RESOLUTION_MS;
    for (let i = 0; i < steps; i += 1) {
      labels[i] = i;

      stacksData[i]             = null;
      lingeringInsanityData[i]  = null;
      insanityData[i]           = null;
      mindbenderData[i]         = null;
      voidTorrentData[i]        = null;
      dispersionData[i]         = null;
      endData[i]                = null;
      endOfVoidformData[i]      = null;
    }

    stacks.forEach(({stack, timestamp}) => {
      fillData(stacksData, timestamp, timestamp+1000, stack);
    });

    // fill in dispersion gaps & 100s+ voidforms:
    for (let i = 0; i <= steps; i++){
      if(stacksData[i] === null && (i * RESOLUTION_MS) + start < ended) stacksData[i] = stacksData[i-1];
    }

    // console.log(stacksData)
    // stacksData.forEach(stack => {

    // })

    // for 100sec+ voidforms
    // if(stacks.length > 0){
    //   const lastStack = stacks[stacks.length-1];
    //   stacksData[atLabel(ended)] = lastStack.stack;
    // }

    endOfVoidformData[atLabel(ended)+1] = MAX_TIME_IN_VOIDFORM/1000;
    endOfVoidformData[atLabel(ended)]   = MAX_TIME_IN_VOIDFORM/1000;
    // console.log(endOfVoidformData)

    insanity.forEach(event => insanityData[atLabel(event.timestamp)] = event.classResources[0].amount/100);

    if(lingeringInsanityStacks.length > 0) lingeringInsanityData[0] = lingeringInsanityStacks[0].stack + 2;
    lingeringInsanityStacks.forEach(lingering => lingeringInsanityData[atLabel(lingering.timestamp)] = lingering.stack);

    dispersions.filter(dispersion => dispersion.start >= start && dispersion.end <= voidFormEnd + TIMESTAMP_ERROR_MARGIN).forEach(dispersion => fillData(dispersionData, dispersion.start, dispersion.end));
    mindbenders.filter(mindbender => mindbender.start >= start && mindbender.end <= voidFormEnd + MAX_MINDBENDER_MS).forEach(mindbender => fillData(mindbenderData, mindbender.start, mindbender.end));
    voidTorrents.filter(voidTorrent => voidTorrent.start >= start && voidTorrent.end <= voidFormEnd + TIMESTAMP_ERROR_MARGIN).forEach(voidTorrent => fillData(voidTorrentData, voidTorrent.start, voidTorrent.end));

    // dispersions.filter(dispersion => dispersion.start >= start && dispersion.end <= voidFormEnd + TIMESTAMP_ERROR_MARGIN).forEach(dispersion => {
    //   const dispersionSteps     = Math.floor((dispersion.end - dispersion.start)/RESOLUTION_MS);
    //   const dispersionStartStep = Math.floor((dispersion.start - start)/RESOLUTION_MS);
    //   for(let i = 0; i < dispersionSteps; i++){
    //     dispersionData[dispersionStartStep+i] = MAX_TIME_IN_VOIDFORM/1000;
    //   } 
    // });

    // mindbenders.filter(mindbender => mindbender.start >= start && mindbender.end <= voidFormEnd ).forEach(mindbender => {
    //   const mindbenderSteps     = Math.floor((mindbender.end - mindbender.start)/RESOLUTION_MS);
    //   const mindbenderStartStep = Math.floor((mindbender.start - start)/RESOLUTION_MS);
    //   for(let i = 0; i < mindbenderSteps; i++){
    //     mindbenderData[mindbenderStartStep+i] = 20;
    //   } 
    // });

    // voidTorrents.filter(voidTorrent => voidTorrent.start >= start && voidTorrent.end <= voidFormEnd + TIMESTAMP_ERROR_MARGIN)


    // console.log(lingeringInsanityData)

    // console.log(labels)
    // return null

    // console.log(lingeringInsanityStacks);

    // console.log(lingeringInsanityData)

    // if(lingeringInsanityStacks.length > 0){

    //   const startingInsanity = lingeringInsanityStacks[0].stack;
    //   for (let i = 0; i <= startingInsanity/2; i++){

    //     lingeringInsanityData[i*(RESOLUTION_MS/1000)] = startingInsanity - i*2;
    //   }
    // }

    // console.log(lingeringInsanityStacks)

    // stacks.forEach(stack => {
    //   const atSecond = timeAsInteger(stack.timestamp - start);
    //   stacksBySecond[atSecond] = stack.stack;

    // });

    // dispersionsInCurrent.forEach(dispersion => {
    //   const durationInSeconds = timeAsSeconds(dispersion.end - dispersion.start);
    //   const latestVoidformStack = timeAsInteger(dispersion.start - start);
    //   for (let i = 0; i <= durationInSeconds; i += 1){
    //     const atSecond = timeAsInteger(dispersion.start - start) + i;
    //     stacksBySecond[latestVoidformStack+i] = latestVoidformStack; 
    //     dispersionBySecond[atSecond] = stacksBySecond[atSecond];
    //   }
    // });

    // mindbendersInCurrent.forEach(mindbender => {
    //   const durationInSeconds = timeAsSeconds(mindbender.end - mindbender.start);
    //   for (let i = 0; i <= durationInSeconds; i += 1){
    //     const atSecond = timeAsInteger(mindbender.start - start) + i;

    //     mindBenderBySecond[atSecond] = stacksBySecond[atSecond] ? stacksBySecond[atSecond] : mindBenderBySecond[atSecond-1];
    //   }
    // });


    // voidTorrentsInCurrent.forEach(voidTorrent => {
    //   const durationInSeconds = timeAsSeconds(voidTorrent.end - voidTorrent.start);
    //   for (let i = 0; i <= durationInSeconds; i += 1){
    //     let atSecond = timeAsInteger(voidTorrent.start - start) + i;
    //     if(atSecond < 0) atSecond = 0;
    //     voidTorrentBySecond[atSecond] = stacksBySecond[atSecond];
    //   }
    // });

    
    let legends = {
      classNames: [
        'stacks',
        'insanity',
        'mindbender',
        'voidtorrent',
        'dispersion',
        'lingeringInsanity',
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
          className: 'mindbender',
          name: 'Mindbender',
          data: Object.keys(mindbenderData).map(key => mindbenderData[key]).slice(0, steps),
        },

        {
          className: 'voidtorrent',
          name: 'Void Torrent',
          data: Object.keys(voidTorrentData).map(key => voidTorrentData[key]).slice(0, steps),
        },

        {
          className: 'dispersion',
          name: 'Dispersion',
          data: Object.keys(dispersionData).map(key => dispersionData[key]).slice(0, steps),
        },

        {
          className: 'lingeringInsanity',
          name: 'Lingering Insanity',
          data: Object.keys(lingeringInsanityData).map(key => lingeringInsanityData[key]).slice(0, steps),
        },
        {
          className: 'endOfVoidform',
          name: 'End of Voidform',
          data: Object.keys(endOfVoidformData).map(key => endOfVoidformData[key]).slice(0, steps),
        },
      ],
    };

    if(includesEndOfFight){
      const fightEndedAtSecond = atLabel(fightEnd);
      endData[fightEndedAtSecond-1] = MAX_TIME_IN_VOIDFORM/1000;
      endData[fightEndedAtSecond]   = MAX_TIME_IN_VOIDFORM/1000;

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
        high: MAX_TIME_IN_VOIDFORM/1000,
        series: {
          'Stacks': {
            lineSmooth: Chartist.Interpolation.none({
              fillHoles: true,
            }),
            showPoint: false,
          },
          'Insanity': {
            lineSmooth: Chartist.Interpolation.step({
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
            return (ms*(RESOLUTION_MS/1000))%5===0 ? formatDuration(ms*(RESOLUTION_MS/1000)) : null;
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
  start: PropTypes.number.isRequired,
  ended: PropTypes.number,
  fightEnd: PropTypes.number,
  stacks: PropTypes.array.isRequired,
  lingeringInsanityStacks: PropTypes.array,
  mindbenders: PropTypes.array,
  voidTorrents: PropTypes.array,
  dispersions: PropTypes.array,
};

export default VoidformGraph;