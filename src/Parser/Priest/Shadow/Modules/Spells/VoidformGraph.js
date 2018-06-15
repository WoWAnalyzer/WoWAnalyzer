import React from 'react';
import PropTypes from 'prop-types';
import {Line} from 'react-chartjs-2';
import SPELLS from 'common/SPELLS';
import {formatDuration} from 'common/format';

import VoidformStyles from './VoidformStyles';

// changing this value will have a large impact on webbrowser performance. About 200 seems to be best of 2 worlds.
const RESOLUTION_MS = 200;
const TIMESTAMP_ERROR_MARGIN = 500;
const NORMAL_VOIDFORM_MS_THRESHOLD = 70000;
const SURRENDER_TO_MADNESS_VOIDFORM_MS_THRESHOLD = 200000; // using surrender automatically maximizes the width of the graph.

// current insanity formula:
// d = 6 + (2/3)*x
// where d = total drain of Insanity over 1 second
// max insanity is 10000 (100 ingame)
const INSANITY_DRAIN_INCREASE = 2 / 3 * 100; // ~66.67;
const INSANITY_DRAIN_INITIAL = 6 * 100; // 600;
const VOIDFORM_MINIMUM_INITIAL_INSANITY = (surrenderToMadness) => surrenderToMadness ? 100 * 100 : 65 * 100; // 6500;


const T20_4P_DECREASE_DRAIN_MODIFIER_NORMAL = 0.9;
const T20_4P_DECREASE_DRAIN_MODIFIER_SURRENDER_TO_MADNESS = 0.95;

const VoidformGraph = ({
                         insanityEvents,
                         surrenderToMadness = false,
                         setT20P4 = false,
                         fightEnd,
                         ...voidform
                       }) => {
  const includesEndOfFight = voidform.ended === undefined || fightEnd <= voidform.ended + TIMESTAMP_ERROR_MARGIN;

  const MAX_TIME_IN_VOIDFORM = surrenderToMadness ? SURRENDER_TO_MADNESS_VOIDFORM_MS_THRESHOLD : NORMAL_VOIDFORM_MS_THRESHOLD;

  const labels = [];

  const stacksData = [];
  const insanityData = [];
  const insanityGeneratedData = [];
  const insanityDrain = [];
  const initialInsanity = insanityEvents.length > 0 ?
    insanityEvents[0].classResources[0].amount - (insanityEvents[0].resourceChange * 100) - (insanityEvents[0].waste * 100) :
    VOIDFORM_MINIMUM_INITIAL_INSANITY(surrenderToMadness);

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

  const INSANITY_DRAIN_START = INSANITY_DRAIN_INITIAL * INSANITY_DRAIN_MODIFIER;
  const INSANITY_DRAIN_INCREASE_BY_SECOND = Math.round(INSANITY_DRAIN_INCREASE * INSANITY_DRAIN_MODIFIER);


  const atLabel = timestamp => Math.floor((timestamp - voidform.start) / RESOLUTION_MS);

  const voidFormIsOver = i => i * RESOLUTION_MS >= voidform.duration;


  const fillData = (data, events) => {
    events && events.forEach(({start, end}) => {
      if(!start || !end) return;
      const firstStep = Math.round(start / RESOLUTION_MS);
      const lastStep = Math.round(end / RESOLUTION_MS);

      for(let i = firstStep; i <= lastStep; i++){
        data[i] = stacksData[i];
      }
    });
  };


  const steps = MAX_TIME_IN_VOIDFORM / RESOLUTION_MS;
  let latestStack = null;
  let latestLIStack = null;

  for (let i = 0; i < steps; i++) {
    labels[i] = i;

    const timestampAtStep = i * RESOLUTION_MS;
    const timestampAtNextStep = (i+1) * RESOLUTION_MS;

    // stacks:
    const currentStack = voidform.stacks.find(({timestamp}) => timestamp >= timestampAtStep && timestamp < timestampAtNextStep);
    if(currentStack) latestStack = currentStack.stack;
    stacksData[i] = timestampAtStep <= voidform.duration ? latestStack : null;

    // lingering insanity stats:
    if(voidform.lingeringInsanityStacks){
      const LIStack = voidform.lingeringInsanityStacks.find(({timestamp}) => timestamp >= timestampAtStep && timestamp < timestampAtNextStep);
      if(LIStack) latestLIStack = LIStack.stack;
    }
    lingeringInsanityData[i] = latestLIStack;


    // fill in all data:
    insanityData[i] = null;
    insanityGeneratedData[i] = null;
    mindbenderData[i] = null;
    voidTorrentData[i] = null;
    dispersionData[i] = null;
    endData[i] = null;
    endOfVoidformData[i] = null;
    if(surrenderToMadness && timestampAtStep >= voidform.duration) break;
  }

  endOfVoidformData[Math.round(voidform.duration / RESOLUTION_MS)] = 100;
  endOfVoidformData[Math.round(voidform.duration / RESOLUTION_MS) + 1] = 100;

  fillData(voidTorrentData, voidform[SPELLS.VOID_TORRENT.id]);
  fillData(mindbenderData, voidform[SPELLS.MINDBENDER_TALENT_SHADOW.id]);
  fillData(dispersionData, voidform[SPELLS.DISPERSION.id]);

  let currentDrain = INSANITY_DRAIN_START;
  let lastestDrainIncrease = 0;
  for (let i = 0; i < steps; i += 1) {
    // set drain to 0 if voidform ended:
    if (voidFormIsOver(i)) {
      currentDrain = 0;
      break;
    }

    // dont increase if dispersion/voidtorrent is active:
    if (dispersionData[i] === null && voidTorrentData[i] === null) {
      lastestDrainIncrease += 1;

      // only increase drain every second:
      if (lastestDrainIncrease % (1000 / RESOLUTION_MS) === 0) {
        currentDrain += INSANITY_DRAIN_INCREASE_BY_SECOND;
      }
    }

    insanityDrain[i] = currentDrain;
  }



  insanityData[0] = initialInsanity;
  insanityEvents.forEach(event => {
    insanityData[atLabel(event.timestamp)] = event.classResources[0].amount;
  });

  let latestInsanityDataAt = 0;
  for (let i = 0; i < steps; i += 1) {
    if (insanityData[i] === null) {
      insanityData[i] = insanityData[latestInsanityDataAt];
      for (let j = latestInsanityDataAt; j <= i; j += 1) {
        if (dispersionData[j] === null && voidTorrentData[j] === null) { insanityData[i] -= insanityDrain[j] / (1000 / RESOLUTION_MS); }
      }

      if (insanityData[i] < 0) insanityData[i] = 0;
    } else {
      latestInsanityDataAt = i;
    }
  }


  let chartData = {
    labels,
    datasets: [
      {
        label: 'Stacks',
        ...VoidformStyles.Stacks,
        data: Object.keys(stacksData).map(key => stacksData[key]).slice(0, steps),
      },
      {
        label: 'Insanity',
        ...VoidformStyles.Insanity,
        data: Object.keys(insanityData).map(key => insanityData[key] / 100).slice(0, steps),
      },
      {
        label: 'Void Torrent',
        ...VoidformStyles.VoidTorrent,
        data: Object.keys(voidTorrentData).map(key => voidTorrentData[key]).slice(0, steps),
      },
      {
        label: 'Mindbender',
        ...VoidformStyles.Mindbender,
        data: Object.keys(mindbenderData).map(key => mindbenderData[key]).slice(0, steps),
      },
      {
        label: 'Dispersion',
        ...VoidformStyles.Dispersion,
        data: Object.keys(dispersionData).map(key => dispersionData[key]).slice(0, steps),
      },
      {
        label: 'End of Voidform',
        ...VoidformStyles.EndofVoidform,
        data: Object.keys(endOfVoidformData).map(key => endOfVoidformData[key]).slice(0, steps),
      },
    ],
  };

  if (voidform.lingeringInsanityStacks) {
    chartData = {
      ...chartData,
      datasets: [
        {
          label: 'Lingering Insanity',
          ...VoidformStyles.LingeringInsanity,
          data: Object.keys(lingeringInsanityData).map(key => lingeringInsanityData[key]).slice(0, steps),
        },

        ...chartData.datasets,
      ],
    };

  }

  if (includesEndOfFight) {
    const fightEndedAtSecond = atLabel(fightEnd);
    endData[fightEndedAtSecond - 1] = 100;
    endData[fightEndedAtSecond] = 100;

    chartData = {
      ...chartData,
      datasets: [
        ...chartData.datasets,
        {
          label: 'End of Fight',
          ...VoidformStyles.EndofFight,
          data: Object.keys(endData).map(key => endData[key]).slice(0, steps),
        },
      ],
    };

  }

  const gridLines = VoidformStyles.gridLines;

  const chartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        gridLines: gridLines,
        ticks: {
          callback: (numberOfStacks, index, values) => {
            return numberOfStacks;
          },
          min: 0,
          max: 100,
          stepSize: 25,
          fontSize: 14,
        },
      }],
      xAxes: [{
        gridLines: gridLines,
        ticks: {
          callback: (ms, index, values) => {
            const everySecond = surrenderToMadness ? 10 : 5;
            return (ms * (RESOLUTION_MS / 1000)) % everySecond === 0 ? formatDuration(ms * (RESOLUTION_MS / 1000)) : null;
          },
          fontSize: 14,
        },
      }],
    },
    animation: {
      duration: 0,
    },
    hover: {
      animationDuration: 0,
    },
    responsiveAnimationDuration: 0,
    tooltips: {
      enabled: false,
    },
    legend: VoidformStyles.legend,
  };


  return (
    <Line
      data={chartData}
      options={chartOptions}
      width={1100}
      height={400}
    />
  );
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
