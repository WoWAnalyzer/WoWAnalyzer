import { t } from '@lingui/macro';

import { i18n } from 'interface/RootLocalizationProvider';

import getBossName from './getBossName';
import getWipeCount from './getWipeCount';
import { formatDuration } from './format';

export default function getFightName(report, fight) {
  const bossName = getBossName(fight, true);
  const wipes = getWipeCount(report.fights, fight);
  const fightResult = fight.kill ? i18n._(t`Kill`) : i18n._(t`Wipe ${wipes}`);
  const duration = formatDuration((fight.end_time - fight.start_time) / 1000);

  return i18n._(t`${bossName} - ${fightResult} (${duration})`);
}
