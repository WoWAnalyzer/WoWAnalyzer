export default function makeReportUrl(reportCode = undefined, fightId = undefined, playerName = undefined, tab = undefined) {
  const parts = [];
  if (reportCode) {
    parts.push(`report/${reportCode}`);
    if (fightId) {
      parts.push(fightId);
      if (playerName) {
        parts.push(playerName);
        if (tab) {
          parts.push(tab);
        }
      }
    }
  }

  return `/${parts.join('/')}`;
}
