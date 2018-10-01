const BaseStyles = {
  borderCapStyle: 'butt',
  borderJoinStyle: 'miter',
  pointBorderWidth: 0,
  pointHoverRadius: 0,
  pointHoverBorderWidth: 0,
  pointRadius: 0,
  pointHitRadius: 0,
  borderWidth: 2,
  spanGaps: true,
};

const PainStyles = {
  Pain : {
    backgroundColor: 'rgba(0,143,255,0.08)',
    borderColor: 'rgba(0,143,255,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  Wasted : {
    backgroundColor: 'rgba(255,45,215,0.2)',
    borderColor: 'rgba(255,109,215,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
};

export default PainStyles;
