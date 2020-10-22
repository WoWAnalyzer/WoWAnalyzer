const defaultGetProp = item => item;
export default function groupDataForChart(dataBySecond, fightDuration, getProp = defaultGetProp) {
  // Mimic WCL's grouping so the charts look similar
  const numPoints = 241; // this is what WCL always does :shrug:
  const pointIntervalSeconds = fightDuration / 1000 / numPoints;
  const groupedData = {};
  const fightDurationSeconds = (fightDuration / 1000);
  for (let second = 0; second < fightDurationSeconds; second += 1) { // every second of the fight
    const valueAtThisSecond = dataBySecond[second] ? getProp(dataBySecond[second]) : 0;
    for (let i = -5; i < 5; i += 1) {
      const x = Math.round(second / pointIntervalSeconds) + i;
      if (x >= 0 && x < fightDurationSeconds) {
        groupedData[x] = (groupedData[x] || 0) + valueAtThisSecond;
      }
    }
  }
  return groupedData;
}
