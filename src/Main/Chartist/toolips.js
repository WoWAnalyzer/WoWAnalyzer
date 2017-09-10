import Chartist from 'chartist';

const defaultOptions = {
};

function position(event, svg) {
  return transform(event.clientX, event.clientY, svg);
}
function transform(x, y, svgElement) {
  const svg = svgElement.tagName === 'svg' ? svgElement : svgElement.ownerSVGElement;
  const matrix = svg.getScreenCTM();
  let point = svg.createSVGPoint();
  point.x = x;
  point.y = y;
  point = point.matrixTransform(matrix.inverse());
  return point || { x: 0, y: 0 };
}
function isInRect(point, rect) {
  return point.x >= rect.x1 && point.x <= rect.x2 && point.y >= rect.y2 && point.y <= rect.y1;
}

const tooltips = (options) => {
  return (chart) => {
    options = Chartist.extend({}, defaultOptions, options);

    if (!(chart instanceof Chartist.Line)) {
      return;
    }
    chart.on('created', (data) => {
      console.log(data);
      const svgNode = data.svg._node;
      let line = null;
      svgNode.addEventListener('mouseleave', (event) => {
        if (!line) return;
        line.remove();
        line = null;
      });
      svgNode.addEventListener('mousemove', (event) => {
        const point = position(event, svgNode);

        if (isInRect(point, data.chartRect)) {
          const location = {
            x1: point.x,
            x2: point.x,
            y1: data.chartRect.y1,
            y2: data.chartRect.y2,
          };

          if (line) {
            line.attr(location);
          } else {
            line = data.svg.elem('line', 'location', 'ct-line');
            line.attr({ style: 'stroke-width:1px;stroke:#fff' });
          }
        }
      });
    });
  };
};

export default tooltips;
