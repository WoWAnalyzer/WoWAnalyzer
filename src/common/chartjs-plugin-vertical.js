import { Chart } from 'react-chartjs-2';

function renderVecticalLine(ctx, pos, scale, color, borderWidth = 1) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = borderWidth;
  ctx.moveTo(pos, scale.top);
  ctx.lineTo(pos, scale.bottom);
  ctx.stroke();
}

const verticalLinesPlugin = {
  beforeDatasetDraw: function (chart, meta) {
    const dataset = chart.data.datasets[meta.index];
    // this point style is normally horizontal, we override drawing it
    // to draw vertical lines when `verticalLine` is set
    //
    // it is done this way so the legend still draws the point style
    // correctly
    if (dataset.pointStyle === 'line' && dataset.verticalLine) {
      meta.meta.data.forEach(element => {
        if (!Number.isFinite(element._model.y)) {
          return;
        }
        renderVecticalLine(chart.chart.ctx, element._model.x, element._yScale, element._model.borderColor, element._model.borderWidth || 1);
      });
      return false;
    }
    return null;
  },
};

Chart.plugins.register(verticalLinesPlugin);
