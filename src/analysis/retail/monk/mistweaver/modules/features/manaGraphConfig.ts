// shared by the mana and mana tea graphs so their plot areas line up and the two can be compared
export const MANA_GRAPH_CONFIG = {
  axis: {
    titleFontWeight: 'normal' as const,
    titleFontSize: 14,
  },
  axisY: {
    titleAngle: 360,
    titlePadding: 25,
    // keep the y axis the same width whatever the labels are
    minExtent: 60,
  },
  // legends beside the plot would make the graphs different widths
  legend: {
    orient: 'top' as const,
    // the default cuts off longer names like the lifecycles consumers
    labelLimit: 300,
  },
};
