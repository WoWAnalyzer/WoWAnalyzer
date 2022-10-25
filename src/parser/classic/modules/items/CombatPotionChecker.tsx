import Potion from 'parser/retail/modules/items/Potion';

const CONSUMABLE_IDS = [
  // https://www.wowhead.com/wotlk/item=40211/potion-of-speed
  // https://www.wowhead.com/wotlk/item=40212/potion-of-wild-magic
  // https://www.wowhead.com/wotlk/item=40093/indestructible-potion
  // https://www.wowhead.com/wotlk/item=42545/runic-mana-injector
  // https://www.wowhead.com/wotlk/item=33448/runic-mana-potion
  // https://www.wowhead.com/wotlk/item=40077/crazy-alchemists-potion
  // https://www.wowhead.com/wotlk/item=41166/runic-healing-injector
  // https://www.wowhead.com/wotlk/item=33447/runic-healing-potion
  // https://www.wowhead.com/wotlk/item=40081/potion-of-nightmares
  // https://www.wowhead.com/wotlk/item=40087/powerful-rejuvenation-potion
  // https://www.wowhead.com/wotlk/item=40214/mighty-fire-protection-potion
  // https://www.wowhead.com/wotlk/item=40215/mighty-frost-protection-potion
  // https://www.wowhead.com/wotlk/item=40217/mighty-shadow-protection-potion
  // https://www.wowhead.com/wotlk/item=40213/mighty-arcane-protection-potion
  // https://www.wowhead.com/wotlk/item=40216/mighty-nature-protection-potion

  53908, // https://www.wowhead.com/wotlk/spell=53908/speed
  53909, // https://www.wowhead.com/wotlk/spell=53909/wild-magic
  53762, // https://www.wowhead.com/wotlk/spell=53762/indestructible
  67490, // https://www.wowhead.com/wotlk/spell=67490/runic-mana-injector
  43186, // https://www.wowhead.com/wotlk/spell=43186/restore-mana
  53750, // https://www.wowhead.com/wotlk/spell=53750/crazy-alchemists-potion
  67489, // https://www.wowhead.com/wotlk/spell=67489/runic-healing-injector
  43185, // https://www.wowhead.com/wotlk/spell=43185/healing-potion
  53753, // https://www.wowhead.com/wotlk/spell=53753/nightmare-slumber
  53761, // https://www.wowhead.com/wotlk/spell=53761/rejuvenation-potion
  53911, // https://www.wowhead.com/wotlk/spell=53911/fire-protection
  53913, // https://www.wowhead.com/wotlk/spell=53913/frost-protection
  53915, // https://www.wowhead.com/wotlk/spell=53915/shadow-protection
  53910, // https://www.wowhead.com/wotlk/spell=53910/arcane-protection
  53914, // https://www.wowhead.com/wotlk/spell=53914/nature-protection
];

class CombatPotionChecker extends Potion {
  static spells = CONSUMABLE_IDS;
  static recommendedEfficiency = 1;
  static extraAbilityInfo = {
    name: 'Combat Potion',
    buffSpellId: CONSUMABLE_IDS,
  };
}

export default CombatPotionChecker;
