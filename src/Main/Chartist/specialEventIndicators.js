import Chartist from 'chartist';

const defaultOptions = {
  series: [],
};
// Based on: https://github.com/yorkshireinteractive/chartist-goal-line/blob/master/scripts/chartist-bar-labels.js#L56
const drawLine = (chartRect, stepLength, value) => {
  const targetLineX = chartRect.x1 + (value * stepLength);

  return {
    x1: targetLineX,
    x2: targetLineX,
    y1: chartRect.y1,
    y2: chartRect.y2,
  };
};

const specialEventIndicators = options => (chart) => {
  options = Chartist.extend({}, defaultOptions, options);

  if (chart instanceof Chartist.Line) {
    chart.on('draw', (data) => {
      if (data.type === 'line' && options.series.includes(data.series.className)) {
        data.element.remove(); // don't show a line, we're handling this one.
        data.values.forEach((point, x) => {
          if (point !== undefined) {
            const line = drawLine(data.chartRect, data.axisX.stepLength, x);

            data.group.elem('line', line, 'ct-line');
          }
        });
      }
    });
  }
};

export default specialEventIndicators;
