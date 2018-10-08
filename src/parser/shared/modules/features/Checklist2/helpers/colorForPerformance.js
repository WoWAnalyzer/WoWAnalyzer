export default function colorForPerformance(performance) {
  if (performance >= 1) {
    return '#4ec04e';
  } else if (performance > 0.666) {
    return '#a6c34c';
  } else if (performance > 0.5) {
    return '#ffc84a';
  } else if (performance > 0.333) {
    return '#df7102';
  } else {
    return '#ac1f39';
  }
}
