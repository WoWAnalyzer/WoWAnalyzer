import { WCLFight } from 'parser/core/Fight';

import { formatDuration } from './format';
import getBossName from './getBossName';
import getWipeCount from './getWipeCount';
import { WCLFightsResponse } from './WCL_TYPES';

export default function getFightName(report: WCLFightsResponse, fight: WCLFight) {
  const bossName = getBossName(fight, true);
  const wipes = getWipeCount(report.fights, fight);
  const fightResult = fight.kill ? `Kill` : `Wipe ${wipes}`;
  const duration = formatDuration(fight.end_time - fight.start_time);

  return `${bossName} - ${fightResult} (${duration})`;
}
