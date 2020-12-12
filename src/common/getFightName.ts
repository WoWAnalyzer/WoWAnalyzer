import { t } from '@lingui/macro';

import Fight from 'parser/core/Fight';

import getBossName from './getBossName';
import getWipeCount from './getWipeCount';
import { formatDuration } from './format';
import { WCLFightsResponse } from './WCL_TYPES';

export default function getFightName(report: WCLFightsResponse, fight: Fight) {
  const bossName = getBossName(fight, true);
  const wipes = getWipeCount(report.fights as Fight[], fight);
  const fightResult = fight.kill ? t({
    id: "common.getFightName.kill",
    message: `Kill`
  }) : t({
    id: "common.getFightName.wipe",
    message: `Wipe ${wipes}`
  });
  const duration = formatDuration((fight.end_time - fight.start_time) / 1000);

  return t({
    id: "common.getFightName.fightname",
    message: `${bossName} - ${fightResult} (${duration})`
  });
}
