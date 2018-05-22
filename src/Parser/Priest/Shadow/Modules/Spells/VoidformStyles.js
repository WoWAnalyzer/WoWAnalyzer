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

const VoidformStyles = {
  Stacks: {
    backgroundColor: 'gba(255,255,255,0.6)',
    borderColor: 'rgba(255,255,255,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: false,
  },
  Insanity: {
    backgroundColor: 'rgba(128,0,128,0.2)',
    borderColor: 'rgba(128,0,128,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: false,
  },
  VoidTorrent: {
    backgroundColor: 'rgba(0,230,0,0.2)',
    borderColor: 'rgba(0,230,0,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  Mindbender: {
    backgroundColor: 'rgba(128,223,255,0.2)',
    borderColor: 'rgba(128,223,255,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  Dispersion: {
    backgroundColor: 'rgba(255,255,0,0.2)',
    borderColor: 'rgba(255,255,0,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  EndofVoidform: {
    backgroundColor: 'rgba(255,0,0,0.6)',
    borderColor: 'rgba(255,0,0,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  LingeringInsanity: {
    backgroundColor: 'rgba(128,128,128,0.2)',
    borderColor: 'rgba(128,128,128,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
  },
  EndofFight: {
    backgroundColor: 'rgba(255,0,0,0.6)',
    borderColor: 'rgba(255,0,0,0.6)',
    ...BaseStyles,
    spanGaps: true,
    fill: true,
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

export default VoidformStyles;
