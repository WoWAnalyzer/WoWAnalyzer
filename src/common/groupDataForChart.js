export default function groupDataForChart(dataBySecond, fightDuration) {
  // Mimic WCL's grouping so the charts look similar
  const numPoints = 241; // this is what WCL always does :shrug:
  const pointIntervalSeconds = fightDuration / 1000 / numPoints;
  const groupedData = {};
  const fightDurationSeconds = (fightDuration / 1000);
  for (let second = 0; second < fightDurationSeconds; second++) { // every second of the fight
    const valueAtThisSecond = dataBySecond[second] ? dataBySecond[second].effective : 0;
    for (let i = -5; i < 5; i++) {
      const x = Math.round(second / pointIntervalSeconds) + i;
      if (x >= 0 && x < fightDurationSeconds) {
        groupedData[x] = (groupedData[x] || 0) + valueAtThisSecond;
      }
    }
  }
  return groupedData;
}
