import { Trans } from '@lingui/macro';
import BaseEnchantChecker from 'parser/shared/modules/items/EnchantChecker';

const ENCHANTABLE_SLOTS = {
  0: <Trans id="common.slots.head">Head</Trans>,
  2: <Trans id="common.slots.shoulder">Shoulder</Trans>,
  4: <Trans id="common.slots.chest">Chest</Trans>,
  // 5: <Trans id={"common.slots.belt"}>Belt</Trans>,        // Eng only
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  8: <Trans id="common.slots.bracers">Bracers</Trans>,
  9: <Trans id="common.slots.gloves">Gloves</Trans>,
  // 10: <Trans id="common.slots.ring">Ring</Trans>,        // Enchanter Only
  // 11: <Trans id="common.slots.ring">Ring</Trans>,        // Enchanter Only
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const MIN_ENCHANT_IDS = [
  // Head
  4245, // https://www.wowhead.com/cata/spell=96245/arcanum-of-vicious-intellect
  4246, // https://www.wowhead.com/cata/spell=96246/arcanum-of-vicious-agility
  4247, // https://www.wowhead.com/cata/spell=96247/arcanum-of-vicious-strength
  // Shoulder
  4197, // https://www.wowhead.com/cata/spell=86847/inscription-of-unbreakable-quartz
  4199, // https://www.wowhead.com/cata/spell=86898/inscription-of-charged-lodestone
  4201, // https://www.wowhead.com/cata/spell=86900/inscription-of-jagged-stone
  4205, // https://www.wowhead.com/cata/spell=86909/inscription-of-shattered-crystal
  // Chest
  4063, // https://www.wowhead.com/cata/spell=74191/enchant-chest-mighty-stats
  4070, // https://www.wowhead.com/cata/spell=74200/enchant-chest-stamina
  // Legs
  3873, // https://www.wowhead.com/cata/spell=56034/masters-spellthread
  4109, // https://www.wowhead.com/cata/spell=75149/ghostly-spellthread
  4111, // https://www.wowhead.com/cata/spell=75151/enchanted-spellthread
  4122, // https://www.wowhead.com/cata/spell=78169/scorched-leg-armor
  4124, // https://www.wowhead.com/cata/spell=78170/twilight-leg-armor
  // Boots
  // Bracers
  4065, // https://www.wowhead.com/cata/spell=74193/enchant-bracer-speed
  4071, // https://www.wowhead.com/cata/spell=74201/enchant-bracer-critical-strike
  // Gloves
  4061, // https://www.wowhead.com/cata/spell=74132/enchant-gloves-mastery
  4075, // https://www.wowhead.com/cata/spell=74212/enchant-gloves-exceptional-strength
  // Ring
  // Cloak
  4072, // https://www.wowhead.com/cata/spell=74202/enchant-cloak-intellect
  4087, // https://www.wowhead.com/cata/spell=74230/enchant-cloak-critical-strike
  // Weapon
  4066, // https://www.wowhead.com/cata/spell=74195/enchant-weapon-mending
  // Offhand
  // Other
  4120, // https://www.wowhead.com/cata/spell=78165/savage-armor-kit
  4121, // https://www.wowhead.com/cata/spell=78166/heavy-savage-armor-kit
];

const MAX_ENCHANT_IDS = [
  // Head
  4206, // https://www.wowhead.com/cata/spell=86931/arcanum-of-the-earthern-ring
  4207, // https://www.wowhead.com/cata/spell=86932/arcanum-of-hyjal
  4208, // https://www.wowhead.com/cata/spell=86933/arcanum-of-the-highlands
  4209, // https://www.wowhead.com/cata/spell=86934/arcanum-of-ramkahen
  // Shoulder
  4198, // https://www.wowhead.com/cata/spell=86854/greater-inscription-of-unbreakable-quartz
  4200, // https://www.wowhead.com/cata/spell=86899/greater-inscription-of-charged-lodestone
  4202, // https://www.wowhead.com/cata/spell=86901/greater-inscription-of-jagged-stone
  4204, // https://www.wowhead.com/cata/spell=86907/greater-inscription-of-shattered-crystal
  // Chest
  4102, // https://www.wowhead.com/cata/spell=74250/enchant-chest-peerless-stats
  // Belt
  4188, // https://www.wowhead.com/cata/spell=84427/grounded-plasma-shield
  4223, // https://www.wowhead.com/cata/spell=55016/nitro-boosts
  // Legs
  4110, // https://www.wowhead.com/cata/spell=75150/powerful-ghostly-spellthread
  4112, // https://www.wowhead.com/cata/spell=75152/powerful-enchanted-spellthread
  4113, // https://www.wowhead.com/cata/spell=75154/masters-spellthread-rank-2
  4126, // https://www.wowhead.com/cata/spell=78171/dragonscale-leg-armor
  4127, // https://www.wowhead.com/cata/spell=78172/charscale-leg-armor
  4270, // https://www.wowhead.com/cata/spell=101598/drakehide-leg-armor
  // Boots
  4062, // https://www.wowhead.com/cata/spell=74189/enchant-boots-earthen-vitality
  4069, // https://www.wowhead.com/cata/spell=74199/enchant-boots-haste
  4076, // https://www.wowhead.com/cata/spell=74213/enchant-boots-major-agility
  4094, // https://www.wowhead.com/cata/spell=74238/enchant-boots-mastery
  4104, // https://www.wowhead.com/cata/spell=74253/enchant-boots-lavawalker
  4105, // https://www.wowhead.com/cata/spell=74252/enchant-boots-assassins-step
  // Bracers
  4101, // https://www.wowhead.com/cata/spell=74248/enchant-bracer-greater-critical-strike
  4108, // https://www.wowhead.com/cata/spell=74256/enchant-bracer-greater-speed
  4256, // https://wowhead.com/cata/spell=96261/enchant-bracer-major-strength
  4257, // https://www.wowhead.com/cata/spell=96262/enchant-bracer-mighty-intellect
  4258, // https://www.wowhead.com/cata/spell=96264/enchant-bracer-agility
  // Gloves
  3604, // https://www.wowhead.com/cata/spell=54999/hyperspeed-accelerators
  4068, // https://www.wowhead.com/cata/spell=74198/enchant-gloves-haste
  4106, // https://www.wowhead.com/cata/spell=74254/enchant-gloves-mighty-strength
  4107, // https://www.wowhead.com/cata/spell=74255/enchant-gloves-greater-mastery
  // Ring
  4078, // https://www.wowhead.com/cata/spell=74215/enchant-ring-strength
  4079, // https://www.wowhead.com/cata/spell=74216/enchant-ring-agility
  4080, // https://www.wowhead.com/cata/spell=74217/enchant-ring-intellect
  4081, // https://www.wowhead.com/cata/spell=74218/enchant-ring-greater-stamina
  // Cloak
  4096, // https://www.wowhead.com/cata/spell=74240/enchant-cloak-greater-intellect
  4100, // https://www.wowhead.com/cata/spell=74247/enchant-cloak-greater-critical-strike
  4115, // https://www.wowhead.com/cata/spell=75172/lightweave-embroidery-rank-2
  // Weapon
  3368, // https://www.wowhead.com/cata/spell=53344/rune-of-the-fallen-crusader
  3370, // https://www.wowhead.com/cata/spell=53343/rune-of-razorice
  3847, // https://www.wowhead.com/cata/spell=62158/rune-of-the-stoneskin-gargoyle
  4097, // https://www.wowhead.com/cata/spell=74242/enchant-weapon-power-torrent
  4098, // https://www.wowhead.com/cata/spell=74244/enchant-weapon-windwalk
  4099, // https://www.wowhead.com/cata/spell=74246/enchant-weapon-landslide
  // 2H Weapon
  4227, // https://www.wowhead.com/cata/spell=95471/enchant-2h-weapon-mighty-agility
  // Ranged
  // Offhand
  4091, // https://www.wowhead.com/cata/spell=74235/enchant-off-hand-superior-intellect
  // Shield
  4085, // https://www.wowhead.com/cata/spell=74226/enchant-shield-mastery
];

class EnchantChecker extends BaseEnchantChecker {
  get EnchantableSlots(): Record<number, JSX.Element> {
    return ENCHANTABLE_SLOTS;
  }

  get MinEnchantIds(): number[] {
    return MIN_ENCHANT_IDS;
  }

  get MaxEnchantIds(): number[] {
    return MAX_ENCHANT_IDS;
  }
}

export default EnchantChecker;
