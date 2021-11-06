import Potion from './Potion';

const CONSUMABLE_IDS = [
  28499, // https://tbc.wowhead.com/spell=28499/restore-mana
  45051, // https://tbc.wowhead.com/spell=45051/mad-alchemists-potion
];

class CombatPotionChecker extends Potion {
  static spells = CONSUMABLE_IDS;
  static recommendedEfficiency = 0.75;
  static extraAbilityInfo = {
    name: 'Combat Potion',
    buffSpellId: [28499, 45051],
  };
}

export default CombatPotionChecker;
