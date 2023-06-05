import ITEMS from 'common/ITEMS/dragonflight/enchants';
import { Enchant } from 'common/ITEMS/Item';
import BaseLegEnhancementChecker from 'parser/shared/modules/items/LegEnhancementChecker';

const MAX_ENHANCEMENT_IDS = [
  ITEMS.FIERCE_ARMOR_KIT_R3,
  ITEMS.FROSTED_ARMOR_KIT_R3,
  ITEMS.LAMBENT_ARMOR_KIT_R3,
  ITEMS.FROZEN_SPELLTHREAD_R3,
  ITEMS.TEMPORAL_SPELLTHREAD_R3,
].map((item) => (item as Enchant).effectId);

export default class LegEnhancementChecker extends BaseLegEnhancementChecker {
  get MaxEnchantIds() {
    return MAX_ENHANCEMENT_IDS;
  }
}
