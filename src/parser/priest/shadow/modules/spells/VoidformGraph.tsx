import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexibleWidthXYPlot as XYPlot,
  DiscreteColorLegend,
  XAxis,
  YAxis,
  LineSeries,
  AreaSeries,
  HorizontalGridLines,
  VerticalGridLines,
} from 'react-vis';
import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';

import VoidformStyles from './VoidformStyles';
import './VoidformGraph.scss';

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
const VOIDFORM_MINIMUM_INITIAL_INSANITY = (surrenderToMadness: any) => surrenderToMadness ? 100 * 100 : 65 * 100; // 6500;

const VoidformGraph: any = ({
  insanityEvents,
  surrenderToMadness = false,
  fightEnd,
  ...voidform
}: any) => {
  const includesEndOfFight = voidform.ended === undefined || fightEnd <= voidform.ended + TIMESTAMP_ERROR_MARGIN;

  const MAX_TIME_IN_VOIDFORM = surrenderToMadness ? SURRENDER_TO_MADNESS_VOIDFORM_MS_THRESHOLD : NORMAL_VOIDFORM_MS_THRESHOLD;

  const labels = [];

  const stacksData: any = [];
  const insanityData: any = [];
  const insanityDrain = [];
  const initialInsanity = insanityEvents.length > 0 ?
    insanityEvents[0].classResources[0].amount - (insanityEvents[0].resourceChange * 100) - (insanityEvents[0].waste * 100) :
    VOIDFORM_MINIMUM_INITIAL_INSANITY(surrenderToMadness);

  const lingeringInsanityData: any = [];
  const mindbenderData: any = [];
  const voidTorrentData: any = [];
  const dispersionData: any = [];

  const endOfVoidformData: any = [];
  const endData: any = [];

  const INSANITY_DRAIN_START = INSANITY_DRAIN_INITIAL;
  const INSANITY_DRAIN_INCREASE_BY_SECOND = Math.round(INSANITY_DRAIN_INCREASE);

  const atLabel = (timestamp: any) => Math.floor((timestamp - voidform.start) / RESOLUTION_MS);

  const voidFormIsOver = (i: number) => i * RESOLUTION_MS >= voidform.duration;

  const fillData = (data: any, events: any) => {
    events && events.forEach(({ start, end }: any) => {
      if (!start || !end) return;
      const firstStep = Math.round(start / RESOLUTION_MS);
      const lastStep = Math.round(end / RESOLUTION_MS);

      for (let i = firstStep; i <= lastStep; i++) {
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
    const timestampAtNextStep = (i + 1) * RESOLUTION_MS;

    // stacks:
    const currentStack = voidform.stacks.find(({ timestamp }: any) => timestamp >= timestampAtStep && timestamp < timestampAtNextStep);
    if (currentStack) latestStack = currentStack.stack;
    stacksData[i] = timestampAtStep <= voidform.duration ? latestStack : null;

    // lingering insanity stats:
    if (voidform.lingeringInsanityStacks) {
      const LIStack = voidform.lingeringInsanityStacks.find(({ timestamp }: any) => timestamp >= timestampAtStep && timestamp < timestampAtNextStep);
      if (LIStack) latestLIStack = LIStack.stack;
    }
    lingeringInsanityData[i] = latestLIStack;

    // fill in all data:
    insanityData[i] = null;
    mindbenderData[i] = null;
    voidTorrentData[i] = null;
    dispersionData[i] = null;
    endData[i] = null;
    endOfVoidformData[i] = null;
    if (surrenderToMadness && timestampAtStep >= voidform.duration) break;
  }

  endOfVoidformData[Math.round(voidform.duration / RESOLUTION_MS)] = 100;
  endOfVoidformData[Math.round(voidform.duration / RESOLUTION_MS) + 1] = 100;

  fillData(voidTorrentData, voidform[SPELLS.VOID_TORRENT_TALENT.id]);
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
  insanityEvents.forEach((event: any) => {
    insanityData[atLabel(event.timestamp)] = event.classResources[0].amount;
  });

  let latestInsanityDataAt = 0;
  for (let i = 0; i < steps; i += 1) {
    if (insanityData[i] === null) {
      insanityData[i] = insanityData[latestInsanityDataAt];
      for (let j = latestInsanityDataAt; j <= i; j += 1) {
        if (dispersionData[j] === null && voidTorrentData[j] === null) {
          insanityData[i] -= insanityDrain[j] / (1000 / RESOLUTION_MS);
        }
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

  // by Chizu: I give up on refactoring this thing.
  // I *really* doubt it couldn't be done in a more comprehensible way but I'm not gonna waste my sanity on it.

  // just try to use info that's already in chartData
  const data = chartData.datasets.map(dataset => {
    // looks like chartData.labels.length always === dataset.data.length (chartjs seemed to require this when it already was separated)
    const _data = dataset.data.map((value, i) => ({
      x: chartData.labels[i],
      y: value,
    }));
    return {
      title: dataset.label,
      backgroundColor: dataset.backgroundColor,
      borderColor: dataset.borderColor,
      fill: dataset.fill,
      data: _data,
    };
  });

  // Chizu: I don't understand why the ticks are the way they are, but I extract them to array
  // so the vertical grid lines can align (they don't do that automatically) to the XAxis ticks
  const xTicks: any = [];
  const everySecond = surrenderToMadness ? 10 : 5;
  chartData.labels.forEach(label => {
    if ((label * (RESOLUTION_MS / 1000)) % everySecond === 0) {
      xTicks.push(label);
    }
  });

  return (
    <XYPlot
      height={400}
      yDomain={[0, 100]}
      margin={{
        top: 30,
      }}
    >
      <DiscreteColorLegend
        orientation="horizontal"
        items={data.map(d => ({
          title: d.title,
          color: d.borderColor,
        }))}
      />
      <XAxis
        tickValues={xTicks}
        tickFormat={value => formatDuration(value * (RESOLUTION_MS / 1000))}
      />
      <YAxis tickValues={[0, 25, 50, 75, 100]} />
      <HorizontalGridLines
        tickValues={[0, 25, 50, 75, 100]}
        style={{
          strokeDasharray: '2, 2',
          stroke: 'rgba(255, 255, 255, 0.6)',
        }}
      />
      <VerticalGridLines
        tickValues={xTicks}
        style={{
          strokeDasharray: '2, 2',
          stroke: 'rgba(255, 255, 255, 0.6)',
        }}
      />
      {/*the getNull property tells react-vis to render only points that have y !== null*/}
      {data.map((dataset: any) => (
        <LineSeries
          data={dataset.data}
          color={dataset.borderColor}
          strokeWidth={2}
          getNull={d => d.y !== null}
        />
      ))}
      {data.filter(d => d.fill).map(dataset => (
        <AreaSeries
          data={dataset.data}
          color={dataset.backgroundColor}
          stroke="transparent"
          getNull={d => d.y !== null}
        />
      ))}
    </XYPlot>
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
};

export default VoidformGraph;
