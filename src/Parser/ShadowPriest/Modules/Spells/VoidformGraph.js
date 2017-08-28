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

const timeAsSeconds = (time) => time/1000;
const timeAsInteger = (time) => Math.floor(time/1000);


const MAX_MINDBENDER_TIME = 21500;
const TIMESTAMP_ERROR_MARGIN = 500;



const VoidformGraph = ({start, ended, stacks, lingeringInsanityStacks, fightEnd, mindbenders, voidTorrents, dispersions, surrenderToMadness=false}) => {
    const voidFormEnd = ended === undefined ? fightEnd : ended;
    const includesEndOfFight = ended === undefined || fightEnd <= ended + TIMESTAMP_ERROR_MARGIN;

    const MAX_SECONDS = surrenderToMadness ? 150 : 65;

    const mindbendersInCurrent   = mindbenders.filter(mindbender => mindbender.start >= start && mindbender.end <= voidFormEnd + MAX_MINDBENDER_TIME);
    const voidTorrentsInCurrent  = voidTorrents.filter(voidTorrent => voidTorrent.start >= start && voidTorrent.end <= voidFormEnd + TIMESTAMP_ERROR_MARGIN);
    const dispersionsInCurrent   = dispersions.filter(dispersion => dispersion.start >= start && dispersion.end <= voidFormEnd + TIMESTAMP_ERROR_MARGIN);

    let labels = [];
    const stacksBySecond = [];
    const mindBenderBySecond = [];
    const voidTorrentBySecond = [];
    const dispersionBySecond = [];
    const endBySecond = [];
    const lingeringInsanityBySecond = [];

    for (let i = 0; i <= MAX_SECONDS; i += 1) {
      labels = [
        ...labels,
        i,
      ];

      stacksBySecond[i]       = null;
      mindBenderBySecond[i]   = null;
      voidTorrentBySecond[i]  = null;
      dispersionBySecond[i]   = null;
      endBySecond[i]          = null;
      lingeringInsanityBySecond[i] = null;
    }

    if(lingeringInsanityStacks.length > 0){

      const startingInsanity = lingeringInsanityStacks[0].stack;
      for (let i = 0; i <= startingInsanity/2; i++){
        lingeringInsanityBySecond[i] = startingInsanity - i*2;
      }
    }

    stacks.forEach(stack => {
      const atSecond = timeAsInteger(stack.timestamp - start);
      stacksBySecond[atSecond] = stack.stack;

    });

    dispersionsInCurrent.forEach(dispersion => {
      const durationInSeconds = timeAsSeconds(dispersion.end - dispersion.start);
      const latestVoidformStack = timeAsInteger(dispersion.start - start);
      for (let i = 0; i <= durationInSeconds; i += 1){
        const atSecond = timeAsInteger(dispersion.start - start) + i;
        stacksBySecond[latestVoidformStack+i] = latestVoidformStack; 
        dispersionBySecond[atSecond] = stacksBySecond[atSecond];
      }
    });

    mindbendersInCurrent.forEach(mindbender => {
      const durationInSeconds = timeAsSeconds(mindbender.end - mindbender.start);
      for (let i = 0; i <= durationInSeconds; i += 1){
        const atSecond = timeAsInteger(mindbender.start - start) + i;

        mindBenderBySecond[atSecond] = stacksBySecond[atSecond] ? stacksBySecond[atSecond] : mindBenderBySecond[atSecond-1];
      }
    });


    voidTorrentsInCurrent.forEach(voidTorrent => {
      const durationInSeconds = timeAsSeconds(voidTorrent.end - voidTorrent.start);
      for (let i = 0; i <= durationInSeconds; i += 1){
        let atSecond = timeAsInteger(voidTorrent.start - start) + i;
        if(atSecond < 0) atSecond = 0;
        voidTorrentBySecond[atSecond] = stacksBySecond[atSecond];
      }
    });

    
    let legends = {
      classNames: [
        'stacks',
        'mindbender',
        'voidtorrent',
        'dispersion',
        'lingeringInsanity',
      ],
    };

    let chartData = {
      labels: labels,
      series: [
        {
          className: 'stacks',
          name: 'Stacks',
          data: Object.keys(stacksBySecond).map(key => stacksBySecond[key]).slice(0, MAX_SECONDS),
        },
        {
          className: 'mindbender',
          name: 'Mindbender',
          data: Object.keys(mindBenderBySecond).map(key => mindBenderBySecond[key]).slice(0, MAX_SECONDS),
        },

        {
          className: 'voidtorrent',
          name: 'Void Torrent',
          data: Object.keys(voidTorrentBySecond).map(key => voidTorrentBySecond[key]).slice(0, MAX_SECONDS),
        },

        {
          className: 'dispersion',
          name: 'Dispersion',
          data: Object.keys(dispersionBySecond).map(key => dispersionBySecond[key]).slice(0, MAX_SECONDS),
        },

        {
          className: 'lingeringInsanity',
          name: 'Lingering Insanity',
          data: Object.keys(lingeringInsanityBySecond).map(key => lingeringInsanityBySecond[key]).slice(0, MAX_SECONDS),
        },
      ],
    };

    if(includesEndOfFight){
      const fightEndedAtSecond = timeAsSeconds(fightEnd - start);
      endBySecond[fightEndedAtSecond-1] = MAX_SECONDS;
      endBySecond[fightEndedAtSecond]   = MAX_SECONDS;

      chartData = {
        ...chartData,
        series: [
          ...chartData.series,
          {
            className: 'endOfFight',
            name: 'End of Fight',
            data: Object.keys(endBySecond).map(key => endBySecond[key]).slice(0, MAX_SECONDS),
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
        high: MAX_SECONDS,
        series: {
          'Stacks': {
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
        },
        fullWidth: true,
        height: '200px',
        axisX: {
          labelInterpolationFnc: function skipLabels(seconds) {
            return seconds%5===0 ? formatDuration(seconds) : null;
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