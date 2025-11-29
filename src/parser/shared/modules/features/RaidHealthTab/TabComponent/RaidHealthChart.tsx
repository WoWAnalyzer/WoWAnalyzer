import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import AutoSizer from 'react-virtualized-auto-sizer';

const DEATH_COLOR = 'rgba(255, 0, 0, 0.8)';

interface Player {
  title: string;
  borderColor: string;
  backgroundColor: string;
  data: { x: number; y: number }[];
}

interface Props {
  players: Player[];
  deaths: { x: number }[];
  startTime: number;
  endTime: number;
}

const RaidHealthChart = ({ players, deaths, startTime, endTime }: Props) => {
  const xValues = [];
  const yValues = [];

  for (let i = 0; i < (endTime - startTime) / 1000; i += 30) {
    xValues.push(i);
  }

  for (let i = 0; i <= players.length; i += 2) {
    yValues.push(i * 100);
  }

  const xAxis = {
    field: 'x',
    type: 'quantitative' as const, // Add 'as const'
    title: 'Time',
    axis: {
      labelExpr: formatTime('datum.value * 1000'),
    },
  };

  const deathSpec = {
    data: {
      name: 'deaths',
    },
    mark: {
      type: 'rule' as const,
      color: DEATH_COLOR,
    },
    encoding: {
      x: xAxis,
    },
  };

  const hpSpec = {
    data: {
      name: 'hp' as const,
    },
    mark: 'area' as const,
    // modern Vega-Lite v5+ syntax uses params instead of selection.
    param: {
      player: {
        type: 'multi',
        fields: ['title'],
        bind: 'legend',
      },
    },
    encoding: {
      x: xAxis,
      y: {
        field: 'y',
        type: 'quantitative' as const,
        stack: true,
        title: 'Total Raid Health',
      },
      color: {
        // defineMessage() returns a message descriptor object,
        // but the Vega-Lite spec needs plain strings. The defineMessage
        // macro is meant for i18n translation in React components,
        // but Vega-Lite specs are plain JavaScript objects that get
        // serialized - they can't use message descriptors.
        // You have two options:
        // Option 1: Use plain strings (simplest) Just use the actual text strings directly in the spec
        // Option 2: Format the messages with i18n._() (if you need translations)
        //   If you truly need i18n support, you'd need to use the useLingui() hook
        //   to get the i18n instance and format the messages:
        field: 'title',
        type: 'nominal' as const,
        title: 'Player',
      },
      opacity: {
        condition: { param: 'player', value: 1 }, // Changed 'selection' to 'param'
        value: 0.3,
      },
    },
  };

  const data = {
    hp: players.flatMap((p) => p.data.map((datum) => ({ ...datum, title: p.title }))),
    deaths,
  };

  const spec = {
    layer: [hpSpec, deathSpec],
  };

  return (
    <AutoSizer disableHeight>
      {({ width }) => <BaseChart height={400} width={width} spec={spec} data={data} />}
    </AutoSizer>
  );
};

export default RaidHealthChart;
