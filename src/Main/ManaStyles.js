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

const ManaStyles = {
  'Boss-0': {
    backgroundColor: 'rgba(215,2,6,0.08)',
    borderColor: 'rgba(215,2,6,0.6)',
    ...BaseStyles,
    fill: true,
  },
  'Boss-1': {
    backgroundColor: 'rgba(250,102,56,0.08)',
    borderColor: 'rgba(250,102,56,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  'Boss-2': {
    backgroundColor: 'rgba(255,211,191,0.08)',
    borderColor: 'rgba(255,211,191,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  'Boss-109041': {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderColor: 'rgba(153,196,57,0.6)',
    ...BaseStyles,
    fill: true,
  },
  'Boss-109040': {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderColor: 'rgba(86,76,172,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  'Boss-109038': {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderColor: 'rgba(243,234,143,0.6)',
    ...BaseStyles,

    spanGaps: true,
    fill: true,
  },
  Mana: {
    backgroundColor: 'rgba(2,109,215,0.25)',
    borderColor: 'rgba(2,109,215,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  Deaths: {
    backgroundColor: 'rgba(255,0,0,0.2)',
    borderColor: 'rgba(255,0,0,0.8)',
    ...BaseStyles,
    showLine: false,
    spanGaps: true,
  },
  ManaUsed: {
    backgroundColor: 'rgba(215, 2, 6, 0.4)',
    borderColor: 'rgba(215, 2, 6, 0.6)',
    ...BaseStyles,
    showLine: true,
    spanGaps: true,
  },
  HPS: {
    backgroundColor: 'rgba(2, 217, 110, 0.2)',
    borderColor: 'rgba(2, 217, 110, 0.6)',
    ...BaseStyles,
    showLine: true,
    spanGaps: true,
  },
  gridLines: {
    display: true,
    color: 'rgba(255, 255, 255, 0.6)',
    borderDash: [2,2],
  },
  legend: {
    display: true,
    labels: {
      fontSize: 16,
      boxWidth: 20,
    },
  },
};

export default ManaStyles;
