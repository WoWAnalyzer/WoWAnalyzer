import { formatTime } from 'parser/ui/BaseChart';

const getAxis = (tickCount: number, yAxisName: string) => {
  const xAxis = {
    field: 'timestamp_shifted',
    type: 'quantitative' as const,
    axis: {
      labelExpr: formatTime('datum.value'),
      tickCount: tickCount,
      grid: false,
      labelAngle: 30,
    },
    scale: {
      zero: false,
      nice: false,
    },
    title: 'Time',
  };

  const yAxis = {
    field: 'count',
    type: 'quantitative' as const,
    axis: {
      gridOpacity: 0.3,
      format: '~s',
      title: yAxisName,
    },
  };
  return { xAxis, yAxis };
};

export default getAxis;
