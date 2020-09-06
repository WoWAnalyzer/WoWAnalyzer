import React from 'react';

import { TopLevelSpec, Config } from 'vega-lite';
import { VegaLite, VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';

const defaultConfig = {
  autosize: {
    type: 'fit' as const,
    contains: 'padding' as const,
  },
  background: '#0000',
  padding: 0,
  view: {
    stroke: null,
  },
  axis: {
    domainColor: 'gray',
    labelColor: '#e9e8e7',
    tickColor: 'gray',
  },
};

type Spec = Omit<TopLevelSpec, "data">;

interface Props {
  spec: Spec;
  data: any;
  config?: Config;
}

// A vega-lite chart displayed in the footer of a <StatisticBox />.
export default function FooterChart(props: Props) {
  const spec = {
    ...props.spec,
    data: { name: 'default_data' },
  };
  return (
    <div style={{
      width: '100%',
    }}>
      <AutoSizer disableHeight>
        {({ width }) => {
          if (width > 0) {
            return (
              <VegaLite
                width={width}
                height={75}
                renderer="canvas"
                theme="dark"
                tooltip={{theme: 'dark'}}
                actions={false}
                data={{default_data: props.data}}
                config={props.config || defaultConfig}
                spec={spec as VisualizationSpec} />
            );
          }
          return null;
        }}
      </AutoSizer>
    </div>
  );
}
