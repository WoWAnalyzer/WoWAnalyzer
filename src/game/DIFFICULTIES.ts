import { defineMessage } from '@lingui/macro';
import { i18n } from '@lingui/core';

const DIFFICULTIES: {
  [key: string]: number;
} = {
  LFR_RAID: 1,
  NORMAL_RAID: 3,
  HEROIC_RAID: 4,
  MYTHIC_RAID: 5,
  MYTHIC_PLUS_DUNGEON: 10,
};
export default DIFFICULTIES;

export const CLASSIC_DIFFICULTIES: {
  [key: string]: number;
} = {
  NORMAL_RAID: 3,
  HEROIC_RAID: 4,
};

export function getLabel(difficulty?: number, hardModeLevel?: number) {
  const isHardMode = hardModeLevel ?? 0;
  switch (difficulty) {
    case DIFFICULTIES.LFR_RAID:
      return i18n._(
        defineMessage({
          id: 'game.difficulties.lfr',
          message: `LFR`,
        }),
      );
    case DIFFICULTIES.NORMAL_RAID:
      if (isHardMode > 0) {
        return i18n._(
          defineMessage({
            id: 'game.difficulties.hardmode',
            message: `Hardmode`,
          }),
        );
      } else {
        return i18n._(
          defineMessage({
            id: 'game.difficulties.nhc',
            message: `Normal`,
          }),
        );
      }
    case DIFFICULTIES.HEROIC_RAID:
      return i18n._(
        defineMessage({
          id: 'game.difficulties.hc',
          message: `Heroic`,
        }),
      );
    case DIFFICULTIES.MYTHIC_RAID:
      return i18n._(
        defineMessage({
          id: 'game.difficulties.mythic',
          message: `Mythic`,
        }),
      );
    case DIFFICULTIES.MYTHIC_PLUS_DUNGEON:
      return i18n._(
        defineMessage({
          id: 'game.difficulties.mythicPlus',
          message: `Mythic+`,
        }),
      );
    default:
      return i18n._(
        defineMessage({
          id: 'game.difficulties.unknown',
          message: `Unknown difficulty`,
        }),
      );
  }
}
