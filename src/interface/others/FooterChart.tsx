import React from 'react';

import { TopLevelSpec, Config } from 'vega-lite';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';

import BaseChart, { defaultConfig, formatTime } from './BaseChart';

export { formatTime };

export type Spec = Omit<TopLevelSpec, "data">;

export interface Props {
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
    <div style={{
      width: '100%',
      height,
    }}>
      <AutoSizer disableHeight>
        {({ width }) => {
          if (width > 0) {
            return (
              <BaseChart
                width={width}
                height={height}
                // eslint-disable-next-line @typescript-eslint/camelcase
                data={{default_data: props.data}}
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
