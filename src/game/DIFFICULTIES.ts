import { t } from '@lingui/macro';

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

export function getLabel(difficulty?: number) {
  switch (difficulty) {
    case DIFFICULTIES.LFR_RAID: return t({
      id: "game.difficulties.lfr",
      message: `LFR`
    });
    case DIFFICULTIES.NORMAL_RAID: return t({
      id: "game.difficulties.nhc",
      message: `Normal`
    });
    case DIFFICULTIES.HEROIC_RAID: return t({
      id: "game.difficulties.hc",
      message: `Heroic`
    });
    case DIFFICULTIES.MYTHIC_RAID: return t({
      id: "game.difficulties.mythic",
      message: `Mythic`
    });
    case DIFFICULTIES.MYTHIC_PLUS_DUNGEON: return t({
      id: "game.difficulties.mythicPlus",
      message: `Mythic+`
    });
    default: return t({
      id: "game.difficulties.unknown",
      message: `Unknown difficulty`
    });
  }
}
