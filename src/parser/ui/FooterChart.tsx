import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { TopLevelSpec, Config } from 'vega-lite';

import BaseChart, { defaultConfig, formatTime } from './BaseChart';

export { formatTime };

export type Spec = Omit<TopLevelSpec, 'data'>;

interface Props {
  spec: Spec;
  data: any;
  config?: Config;
  height?: number;
}

// A vega-lite chart displayed in the footer of a <StatisticBox />.
export default function FooterChart(props: Props) {
  const spec = {
    ...props.spec,
    data: { name: 'default_data' },
  };
  const height = props.height || 75;

  return (
    <div
      style={{
        width: '100%',
        height,
      }}
    >
      <AutoSizer disableHeight>
        {({ width }) => {
          if (width > 0) {
            return (
              <BaseChart
                width={width}
                height={height}
                data={{ default_data: props.data }}
                config={props.config || defaultConfig}
                spec={spec as VisualizationSpec}
              />
            );
          }
          return null;
        }}
      </AutoSizer>
    </div>
  );
}
