import { defineMessage } from '@lingui/core/macro';
import { getLabel } from 'game/DIFFICULTIES';
import { WCLFight } from 'parser/core/Fight';
import { i18n } from '@lingui/core';

export default function getBossName(fight: WCLFight, withDifficulty = true): string {
  return withDifficulty
    ? i18n._(
        defineMessage({
          id: 'common.getBossName',
          message: `${getLabel(fight.difficulty, fight.hardModeLevel)} ${fight.name}`,
        }),
      )
    : fight.name;
}
