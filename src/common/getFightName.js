import { t } from '@lingui/macro';

import { i18n } from 'interface/RootLocalizationProvider';

import getBossName from './getBossName';
import getWipeCount from './getWipeCount';
import { formatDuration } from './format';

export default function getFightName(report, fight) {
  const wipes = getWipeCount(report.fights, fight);
  return `${getBossName(fight)} - ${fight.kill ? i18n._(t`Kill`) : i18n._(t`Wipe ${wipes}`)} (${formatDuration((fight.end_time - fight.start_time) / 1000)})`;
}
