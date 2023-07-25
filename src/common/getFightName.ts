import { defineMessage } from '@lingui/macro';
import { WCLFight } from 'parser/core/Fight';

import { formatDuration } from './format';
import getBossName from './getBossName';
import getWipeCount from './getWipeCount';
import { WCLFightsResponse } from './WCL_TYPES';
import { i18n } from '@lingui/core';

export default function getFightName(report: WCLFightsResponse, fight: WCLFight) {
  const bossName = getBossName(fight, true);
  const wipes = getWipeCount(report.fights, fight);
  const fightResult = fight.kill
    ? i18n._(
        defineMessage({
          id: 'common.getFightName.kill',
          message: `Kill`,
        }),
      )
    : i18n._(
        defineMessage({
          id: 'common.getFightName.wipe',
          message: `Wipe ${wipes}`,
        }),
      );
  const duration = formatDuration(fight.end_time - fight.start_time);

  return i18n._(
    defineMessage({
      id: 'common.getFightName.fightname',
      message: `${bossName} - ${fightResult} (${duration})`,
    }),
  );
}
