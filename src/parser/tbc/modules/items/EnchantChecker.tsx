import { Trans } from '@lingui/macro';
import BaseEnchantChecker from 'parser/shared/modules/items/EnchantChecker';
import React from 'react';

// Example logs with missing enchants:
// https://www.warcraftlogs.com/reports/ydxavfGq1mBrM9Vc/#fight=1&source=14

const ENCHANTABLE_SLOTS = {
  0: <Trans id="common.slots.head">Head</Trans>,
  2: <Trans id="common.slots.shoulder">Shoulder</Trans>,
  4: <Trans id="common.slots.chest">Chest</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  8: <Trans id="common.slots.bracers">Bracers</Trans>,
  9: <Trans id="common.slots.gloves">Gloves</Trans>,
  // 10: <Trans id="common.slots.ring">Ring</Trans>,
  // 11: <Trans id="common.slots.ring">Ring</Trans>,
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  // 16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const MIN_ENCHANT_IDS = [
  // Head
  // Shoulder
  2979, // https://tbc.wowhead.com/spell=35403/inscription-of-faith
  2983, // https://tbc.wowhead.com/spell=35407/inscription-of-vengeance
  2981, // https://tbc.wowhead.com/spell=35405/inscription-of-discipline
  2977, // https://tbc.wowhead.com/spell=35355/inscription-of-warding
  2994, // https://tbc.wowhead.com/spell=35436/inscription-of-the-orb
  2990, // https://tbc.wowhead.com/spell=35432/inscription-of-the-knight
  2996, // https://tbc.wowhead.com/spell=35438/inscription-of-the-blade
  2992, // https://tbc.wowhead.com/spell=35434/inscription-of-the-oracle
  // Chest
  // Legs
  3011, // https://tbc.wowhead.com/spell=35489/clefthide-leg-armor
  3010, // https://tbc.wowhead.com/spell=35488/cobrahide-leg-armor
  2747, // https://tbc.wowhead.com/spell=31371/mystic-spellthread
  2745, // https://tbc.wowhead.com/spell=31369/silver-spellthread
  // Boots
  // Bracers
  // Gloves
  // Ring
  // Cloak
  // Weapon
  // Offhand
];

const MAX_ENCHANT_IDS = [
  // Head
  3006, // https://tbc.wowhead.com/spell=35455/glyph-of-arcane-warding
  3007, // https://tbc.wowhead.com/spell=35456/glyph-of-fire-warding
  3008, // https://tbc.wowhead.com/spell=35457/glyph-of-frost-warding
  3005, // https://tbc.wowhead.com/spell=35454/glyph-of-nature-warding
  3009, // https://tbc.wowhead.com/spell=35458/glyph-of-shadow-warding
  3002, // https://tbc.wowhead.com/spell=35447/glyph-of-power
  3001, // https://tbc.wowhead.com/spell=35445/glyph-of-renewal
  2999, // https://tbc.wowhead.com/spell=35443/glyph-of-the-defender
  3003, // https://tbc.wowhead.com/spell=35452/glyph-of-ferocity
  3096, // https://tbc.wowhead.com/spell=37891/glyph-of-the-outcast
  3004, // https://tbc.wowhead.com/spell=35453/glyph-of-the-gladiator

  // Shoulder
  2980, // https://tbc.wowhead.com/spell=35404/greater-inscription-of-faith
  2986, // https://tbc.wowhead.com/spell=35417/greater-inscription-of-vengeance
  2982, // https://tbc.wowhead.com/spell=35406/greater-inscription-of-discipline
  2978, // https://tbc.wowhead.com/spell=35402/greater-inscription-of-warding
  2991, // https://tbc.wowhead.com/spell=35433/greater-inscription-of-the-knight
  2997, // https://tbc.wowhead.com/spell=35439/greater-inscription-of-the-blade
  2993, // https://tbc.wowhead.com/spell=35435/greater-inscription-of-the-oracle
  2995, // https://tbc.wowhead.com/spell=35437/greater-inscription-of-the-orb

  // Other
  2715, // https://tbc.wowhead.com/spell=29475/resilience-of-the-scourge

  // Chest
  1950, // https://tbc.wowhead.com/spell=46594/enchant-chest-defense
  2933, // https://tbc.wowhead.com/spell=33992/enchant-chest-major-resilience
  3150, // https://tbc.wowhead.com/spell=33991/enchant-chest-restore-mana-prime
  2659, // https://tbc.wowhead.com/spell=46501/enchant-chest-exceptional-health
  2661, // https://tbc.wowhead.com/spell=46502/enchant-chest-exceptional-stats
  1144, // https://tbc.wowhead.com/spell=46504/enchant-chest-major-spirit

  // Legs
  3013, // https://tbc.wowhead.com/spell=35495/nethercleft-leg-armor
  3012, // https://tbc.wowhead.com/spell=35490/nethercobra-leg-armor
  2748, // https://tbc.wowhead.com/spell=31372/runic-spellthread
  2746, // https://tbc.wowhead.com/spell=31370/golden-spellthread

  // Boots
  2940, // https://tbc.wowhead.com/spell=34008/enchant-boots-boars-speed
  2656, // https://tbc.wowhead.com/spell=27948/enchant-boots-vitality
  2658, // https://tbc.wowhead.com/spell=27954/enchant-boots-surefooted
  2939, // https://tbc.wowhead.com/spell=46471/enchant-boots-cats-swiftness
  2657, // https://tbc.wowhead.com/spell=46472/enchant-boots-dexterity
  2656, // https://tbc.wowhead.com/spell=46492/enchant-boots-vitality

  // Bracers
  1593, // https://tbc.wowhead.com/spell=34002/enchant-bracer-assault
  2650, // https://tbc.wowhead.com/spell=46498/enchant-bracer-spellpower
  2617, // https://tbc.wowhead.com/spell=46500/enchant-bracer-superior-healing
  2679, // https://tbc.wowhead.com/spell=46497/enchant-bracer-restore-mana-prime
  2648, // https://tbc.wowhead.com/spell=27906/enchant-bracer-major-defense
  1891, // https://tbc.wowhead.com/spell=46499/enchant-bracer-stats
  369, // https://tbc.wowhead.com/spell=46496/enchant-bracer-major-intellect
  2649, // https://tbc.wowhead.com/spell=46494/enchant-bracer-fortitude
  2647, // https://tbc.wowhead.com/spell=46493/enchant-bracer-brawn

  // Gloves
  3260, // https://tbc.wowhead.com/spell=44769/glove-reinforcements
  2937, // https://tbc.wowhead.com/spell=46514/enchant-gloves-major-spellpower
  2322, // https://tbc.wowhead.com/spell=46513/enchant-gloves-major-healing
  2935, // https://tbc.wowhead.com/spell=46516/enchant-gloves-spell-strike
  2934, // https://tbc.wowhead.com/spell=46512/enchant-gloves-blasting
  1594, // https://tbc.wowhead.com/spell=46511/enchant-gloves-assault

  // Ring
  2930, // https://tbc.wowhead.com/spell=46517/enchant-ring-healing-power
  2928, // https://tbc.wowhead.com/spell=46518/enchant-ring-spellpower
  2931, // https://tbc.wowhead.com/spell=46519/enchant-ring-stats
  2929, // https://tbc.wowhead.com/spell=46520/enchant-ring-striking

  // Cloak
  2662, // https://tbc.wowhead.com/spell=46510/enchant-cloak-major-armor
  2938, // https://tbc.wowhead.com/spell=46509/enchant-cloak-spell-penetration
  368, // https://tbc.wowhead.com/spell=46505/enchant-cloak-greater-agility
  2664, // https://tbc.wowhead.com/spell=46508/enchant-cloak-major-resistance
  1257, // https://tbc.wowhead.com/spell=46506/enchant-cloak-greater-arcane-resistance
  1441, // https://tbc.wowhead.com/spell=46507/enchant-cloak-greater-shadow-resistance
  2648, // https://tbc.wowhead.com/spell=47051/enchant-cloak-steelweave
  2621, // https://tbc.wowhead.com/spell=25084/enchant-cloak-subtlety

  // Weapon
  963, // https://tbc.wowhead.com/spell=46535/enchant-weapon-major-striking
  3222, // https://tbc.wowhead.com/spell=46529/enchant-weapon-greater-agility
  2666, // https://tbc.wowhead.com/spell=46532/enchant-weapon-major-intellect
  2668, // https://tbc.wowhead.com/spell=46537/enchant-weapon-potency
  2669, // https://tbc.wowhead.com/spell=46533/enchant-weapon-major-spellpower
  2343, // https://tbc.wowhead.com/spell=46531/enchant-weapon-major-healing
  2672, // https://tbc.wowhead.com/spell=46538/enchant-weapon-soulfrost
  2671, // https://tbc.wowhead.com/spell=46540/enchant-weapon-sunfire
  2673, // https://tbc.wowhead.com/spell=46536/enchant-weapon-mongoose
  2675, // https://tbc.wowhead.com/spell=46527/enchant-weapon-battlemaster
  3273, // https://tbc.wowhead.com/spell=46578/enchant-weapon-deathfrost
  2674, // https://tbc.wowhead.com/spell=46539/enchant-weapon-spellsurge
  3225, // https://tbc.wowhead.com/spell=42974/enchant-weapon-executioner
  3223, // https://tbc.wowhead.com/spell=42688/adamantite-weapon-chain
  2667, // https://tbc.wowhead.com/spell=46462/enchant-2h-weapon-savagery
  2670, // https://tbc.wowhead.com/spell=46461/enchant-2h-weapon-major-agility

  // 2H Weapon
  2667, //  https://tbc.wowhead.com/spell=46462/enchant-2h-weapon-savagery
  2670, // https://tbc.wowhead.com/spell=46461/enchant-2h-weapon-major-agility

  // Ranged
  2722, // https://tbc.wowhead.com/spell=30250/adamantite-scope
  2723, // https://tbc.wowhead.com/spell=30252/khorium-scope
  2724, // https://tbc.wowhead.com/spell=30260/stabilitzed-eternium-scope

  // Offhand
  2655, // https://tbc.wowhead.com/spell=46526/enchant-shield-shield-block
  2653, // https://tbc.wowhead.com/spell=27944/enchant-shield-tough-shield
  3229, // https://tbc.wowhead.com/spell=44383/enchant-shield-resilience
  1888, // https://tbc.wowhead.com/spell=46525/enchant-shield-resistance
  2654, // https://tbc.wowhead.com/spell=46522/enchant-shield-intellect
  1071, // https://tbc.wowhead.com/spell=46524/enchant-shield-major-stamina
  2714, // https://tbc.wowhead.com/spell=29454/felsteel-shield-spike

  // Armor Kits
  2841, // https://tbc.wowhead.com/item=34330/heavy-knothide-armor-kit
  2792, // https://tbc.wowhead.com/item=25650/knothide-armor-kit
  2793, // https://tbc.wowhead.com/item=25651/vindicators-armor-kit
  2794, // https://tbc.wowhead.com/item=25652/magisters-armor-kit
  2989, // https://tbc.wowhead.com/item=29488/arcane-armor-kit
  2985, // https://tbc.wowhead.com/item=29485/flame-armor-kit
  2987, // https://tbc.wowhead.com/item=29486/frost-armor-kit
  2988, // https://tbc.wowhead.com/item=29487/nature-armor-kit
  2984, // https://tbc.wowhead.com/item=29483/shadow-armor-kit
];

class EnchantChecker extends BaseEnchantChecker {
  get EnchantableSlots(): any {
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
