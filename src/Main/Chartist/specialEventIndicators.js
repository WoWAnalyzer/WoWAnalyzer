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

const specialEventIndicators = (options) => {
  return (chart) => {
    options = Chartist.extend({}, defaultOptions, options);

    if (chart instanceof Chartist.Line) {
      chart.on('created', function (context) {
        options.series.forEach((series) => {
          series.data.forEach((item) => {
            const line = drawLine(context.chartRect, context.axisX.stepLength, item.x);

            context.svg.elem('line', line, series.className);
          });
        });
      });
    }
  };
};

export default specialEventIndicators;
