import React from 'react';
import { Config } from 'vega-lite';
import { VegaLite, VisualizationSpec } from 'react-vega';

export const defaultConfig = {
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

export interface Props {
  spec: VisualizationSpec;
  data: any;
  config?: Config;
  width?: number;
  height?: number;
  renderer?: 'canvas' | 'svg';
}

export function formatTime(field: string = 'datum.timestamp') {
  return `if(${field} / 1000 >= 60, toString(floor(${field} / 60000)) + 'm ', '') + toString(floor(${field} / 1000) % 60) + 's'`;
}

export default function BaseChart(props: Props) {
  const prp = {
    config: defaultConfig,
    renderer: 'canvas' as const,
    ...props,
    spec: {
      ...props.spec,
      datasets: props.data,
    },
    data: undefined,
  };

  return <VegaLite theme="dark" tooltip={{ theme: 'dark' }} actions={false} {...prp} />;
}
