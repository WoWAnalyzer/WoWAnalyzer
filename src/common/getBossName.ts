import { t } from '@lingui/macro';

import { getLabel } from 'game/DIFFICULTIES';
import { i18n } from 'interface/RootLocalizationProvider';
import Fight from 'parser/core/Fight';

export default function getBossName(fight: Fight, withDifficulty: boolean = true): string {
  return withDifficulty ? i18n._(t`${getLabel(fight.difficulty)} ${fight.name}`) : fight.name;
}
