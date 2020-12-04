import { t } from '@lingui/macro';
import { i18n } from 'interface/RootLocalizationProvider';

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
    case DIFFICULTIES.LFR_RAID: return i18n._(t('game.difficulties.lfr')`LFR`);
    case DIFFICULTIES.NORMAL_RAID: return i18n._(t('game.difficulties.nhc')`Normal`);
    case DIFFICULTIES.HEROIC_RAID: return i18n._(t('game.difficulties.hc')`Heroic`);
    case DIFFICULTIES.MYTHIC_RAID: return i18n._(t('game.difficulties.mythic')`Mythic`);
    case DIFFICULTIES.MYTHIC_PLUS_DUNGEON: return i18n._(t('game.difficulties.mythicPlus')`Mythic+`);
    default: return i18n._(t('game.difficulties.unknown')`Unknown difficulty`);
  }
}
