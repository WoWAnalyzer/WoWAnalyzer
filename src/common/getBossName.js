import { t } from '@lingui/macro';

import { getLabel } from 'game/DIFFICULTIES';
import { i18n } from 'interface/RootLocalizationProvider';

export default function getBossName(fight, withDifficulty = true) {
  return withDifficulty ? i18n._(t`${getLabel(fight.difficulty)} ${fight.name}`) : fight.name;
}
