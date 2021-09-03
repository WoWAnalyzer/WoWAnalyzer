import Potion from 'parser/shadowlands/modules/items/Potion';

const CONSUMABLE_IDS = [
  28499, // https://tbc.wowhead.com/spell=28499/restore-mana
];

class CombatPotionChecker extends Potion {
  static spells = [28499];
  static recommendedEfficiency = 0.5;
  static extraAbilityInfo = {
    name: 'Combat Potion',
    buffSpellId: [28499],
  };

  get ConsumableIds(): number[] {
    return CONSUMABLE_IDS;
  }

  get CooldownTime(): number {
    return 6000;
  }
}

export default CombatPotionChecker;
