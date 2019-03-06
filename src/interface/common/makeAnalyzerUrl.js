import getFightName from 'common/getFightName';
import prettyEncodeURI from 'common/prettyEncodeURI';

export function makePlainUrl(reportCode = undefined, fightId = undefined, fightName = undefined, playerId = undefined, playerName = undefined, tab = undefined) {
  const parts = [];
  if (reportCode) {
    parts.push(`report/${reportCode}`);
    if (fightId) {
      parts.push(fightName ? `${fightId}-${prettyEncodeURI(fightName)}` : `${fightId}`);
      if (playerId) {
        parts.push(playerName ? `${playerId}-${prettyEncodeURI(playerName)}` : `${playerId}`);
        if (tab) {
          parts.push(tab);
        }
      }
    }
  }
  return `/${parts.join('/')}`;
}

export default function makeReportUrl(report = undefined, fightId = undefined, playerId = undefined, tab = undefined) {
  const parts = [];
  if (report) {
    parts.push(`report/${report.code}`);
    if (fightId) {
      const fight = report.fights.find(fight => fight.id === fightId);
      const fightName = fight ? getFightName(report, fight) : null;
      if (fightName) {
        parts.push(`${fightId}-${prettyEncodeURI(fightName)}`);
        if (playerId) {
          const player = report.friendlies.find(friendly => friendly.id === playerId);
          const playerName = player ? player.name : null;
          const duplicatePlayerNames = report.friendlies.filter(friendly => friendly.name === playerName);
          if (playerName) {
            parts.push(duplicatePlayerNames.length > 1 ? `${playerId}-${prettyEncodeURI(playerName)}` : prettyEncodeURI(playerName));
            if (tab) {
              parts.push(tab);
            }
          }
        }
      }
    }
  }
  return `/${parts.join('/')}`;
}
