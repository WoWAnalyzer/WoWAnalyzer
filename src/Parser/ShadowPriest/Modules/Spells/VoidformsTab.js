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


const VoidformsTab = ({voidforms=[], ...modules}) => {
  if(voidforms.length === 0) return null;
  return (<div className="voidforms">{voidforms.map((voidform, i) => <VoidformGraph key={i} {...voidform} {...modules} />)}</div>);
};

VoidformsTab.propTypes = {
  voidforms: PropTypes.array.isRequired,
  fightEnd: PropTypes.number.isRequired,
};

const MAX_SECONDS = 65;

const VoidformGraph = ({start, ended, stacks, lingeringInsanityStacks, fightEnd, mindbenders, voidTorrents, dispersions}) => {
    const voidFormEnd = ended === undefined ? fightEnd : ended;
    const includesEndOfFight = ended === undefined || fightEnd <= ended + 1000;

    const mindbendersInCurrent   = mindbenders.filter(mindbender => mindbender.start >= start && mindbender.end <= voidFormEnd + 21500);
    const voidTorrentsInCurrent  = voidTorrents.filter(voidTorrent => voidTorrent.start >= start && voidTorrent.end <= voidFormEnd + 500);
    const dispersionsInCurrent   = dispersions.filter(dispersion => dispersion.start >= start && dispersion.end <= voidFormEnd + 500);

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
      const atSecond = Math.round((stack.timestamp - start)/1000);
      stacksBySecond[atSecond] = stack.stack;

    });

    mindbendersInCurrent.forEach(mindbender => {
      const durationInSeconds = (mindbender.end - mindbender.start)/1000;
      for (let i = 0; i <= durationInSeconds; i += 1){
        const atSecond = Math.round((mindbender.start - start)/1000)+i;
        mindBenderBySecond[atSecond] = stacksBySecond[atSecond] ? stacksBySecond[atSecond] : 15;
      }
    });

    voidTorrentsInCurrent.forEach(voidTorrent => {
      const durationInSeconds = (voidTorrent.end - voidTorrent.start)/1000;
      for (let i = 0; i <= durationInSeconds; i += 1){
        let atSecond = Math.round((voidTorrent.start - start)/1000)+i;
        if(atSecond < 0) atSecond = 0;
        voidTorrentBySecond[atSecond] = stacksBySecond[atSecond];
      }
    });

    dispersionsInCurrent.forEach(dispersion => {
      const durationInSeconds = (dispersion.end - dispersion.start)/1000;
      let latestVoidformStack = 0;
      for (let i = 0; i <= durationInSeconds; i += 1){
        const atSecond = Math.round((dispersion.start - start)/1000)+i;
        if(stacksBySecond[atSecond-1] !== null) latestVoidformStack = stacksBySecond[atSecond-1];
        if(i === durationInSeconds) stacksBySecond[atSecond] = latestVoidformStack;
        dispersionBySecond[atSecond] = latestVoidformStack;
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
      const fightEndedAtSecond = Math.round((fightEnd - start)/1000);
      endBySecond[fightEndedAtSecond-1] = MAX_SECONDS;
      endBySecond[fightEndedAtSecond] = MAX_SECONDS;

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
            return `${numberOfStacks}`;
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

export default VoidformsTab;