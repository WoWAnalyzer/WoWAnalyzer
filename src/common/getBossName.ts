import { t } from '@lingui/macro';

import { getLabel } from 'game/DIFFICULTIES';
import Fight from 'parser/core/Fight';

export default function getBossName(fight: Fight, withDifficulty: boolean = true): string {
  return withDifficulty ? t`${getLabel(fight.difficulty)} ${fight.name}` : fight.name;
}
