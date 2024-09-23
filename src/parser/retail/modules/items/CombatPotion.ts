import SPELLS from 'common/SPELLS/thewarwithin/potions';
import Potion from 'parser/retail/modules/items/Potion';

/**
 * Tracks combat potion cooldown (DPS, HPS, mana, mitigation).
 */
class CombatPotion extends Potion {
  static spells = [
    SPELLS.ALGARI_MANA_POTION.id,
    SPELLS.CAVEDWELLERS_DELIGHT.id,
    SPELLS.DRAUGHT_OF_SHOCKING_REVELATIONS.id,
    SPELLS.FRONTLINE_POTION.id,
    SPELLS.GROTESQUE_VIAL.id,
    SPELLS.POTION_OF_THE_REBORN_CHEETAH.id,
    SPELLS.POTION_OF_UNWAVERING_FOCUS.id,
    SPELLS.SLUMBERING_SOUL_SERUM.id,
    SPELLS.TEMPERED_POTION.id,
    SPELLS.TREADING_LIGHTLY.id,
  ];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    name: 'Combat Potion',
    buffSpellId: [
      SPELLS.ALGARI_MANA_POTION.id,
      SPELLS.CAVEDWELLERS_DELIGHT.id,
      SPELLS.DRAUGHT_OF_SHOCKING_REVELATIONS.id,
      SPELLS.FRONTLINE_POTION.id,
      SPELLS.GROTESQUE_VIAL.id,
      SPELLS.POTION_OF_THE_REBORN_CHEETAH.id,
      SPELLS.POTION_OF_UNWAVERING_FOCUS.id,
      SPELLS.SLUMBERING_SOUL_SERUM.id,
      SPELLS.TEMPERED_POTION.id,
      SPELLS.TREADING_LIGHTLY.id,
    ],
  };
}

export default CombatPotion;
