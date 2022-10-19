import { Trans } from '@lingui/macro';
import BaseEnchantChecker from 'parser/shared/modules/items/EnchantChecker';

// Example logs with missing enchants:
// https://www.warcraftlogs.com/reports/ydxavfGq1mBrM9Vc/#fight=1&source=14

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
  // 16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

const MIN_ENCHANT_IDS = [
  // Head
  3795, // https://www.wowhead.com/wotlk/spell=59777/arcanum-of-triumph
  3797, // https://www.wowhead.com/wotlk/spell=59784/arcanum-of-dominance
  3842, // https://www.wowhead.com/wotlk/spell=61271/arcanum-of-the-savage-gladiator
  3815, // https://www.wowhead.com/wotlk/spell=59947/arcanum-of-the-eclipsed-moon
  3816, // https://www.wowhead.com/wotlk/spell=59948/arcanum-of-the-flames-soul
  3812, // https://www.wowhead.com/wotlk/spell=59944/arcanum-of-the-frosty-soul
  3813, // https://www.wowhead.com/wotlk/spell=59945/arcanum-of-toxic-warding
  3814, // https://www.wowhead.com/wotlk/spell=59946/arcanum-of-the-fleeing-shadow

  // Shoulder
  3875, // https://www.wowhead.com/wotlk/spell=59929/inscription-of-the-axe
  3876, // https://www.wowhead.com/wotlk/spell=59932/inscription-of-the-pinnacle
  3806, // https://www.wowhead.com/wotlk/spell=59927/inscription-of-the-storm
  3807, // https://www.wowhead.com/wotlk/spell=59928/inscription-of-the-crag
  3793, // https://www.wowhead.com/wotlk/spell=59771/inscription-of-triumph
  3794, // https://www.wowhead.com/wotlk/spell=59773/inscription-of-dominance

  // Chest
  3236, // https://www.wowhead.com/wotlk/spell=44492/enchant-chest-mighty-health
  3252, // https://www.wowhead.com/wotlk/spell=44623/enchant-chest-super-stats

  // Legs
  // Boots
  // Bracers
  1600, // https://www.wowhead.com/wotlk/spell=60616/enchant-bracers-striking
  2326, // https://www.wowhead.com/wotlk/spell=44635/enchant-bracers-greater-spellpower

  3763, // https://www.wowhead.com/wotlk/spell=57701/fur-lining-arcane-resist
  3759, // https://www.wowhead.com/wotlk/spell=57692/fur-lining-fire-resist
  3760, // https://www.wowhead.com/wotlk/spell=57694/fur-lining-frost-resist
  3762, // https://www.wowhead.com/wotlk/spell=57699/fur-lining-nature-resist
  3761, // https://www.wowhead.com/wotlk/spell=57696/fur-lining-shadow-resist

  // Gloves

  3829, // https://www.wowhead.com/wotlk/spell=44513/enchant-gloves-greater-assault
  // Ring
  // Cloak
  3825, // https://www.wowhead.com/wotlk/spell=60609/enchant-cloak-speed
  1099, // https://www.wowhead.com/wotlk/spell=60663/enchant-cloak-major-agility
  1262, // https://www.wowhead.com/wotlk/spell=44596/enchant-cloak-superior-arcane-resistance
  1354, // https://www.wowhead.com/wotlk/spell=44556/enchant-cloak-superior-fire-resistance
  3230, // https://www.wowhead.com/wotlk/spell=44483/enchant-cloak-superior-frost-resistance
  1400, // https://www.wowhead.com/wotlk/spell=44494/enchant-cloak-superior-nature-resistance
  1446, // https://www.wowhead.com/wotlk/spell=44590/enchant-cloak-superior-shadow-resistance

  // Weapon
  // Offhand

  // Other
  3330, // https://www.wowhead.com/wotlk/spell=50909/heavy-borean-armor-kit
  3329, // https://www.wowhead.com/wotlk/spell=50906/borean-armor-kit

];

const MAX_ENCHANT_IDS = [
  // Head
  3819,  // https://www.wowhead.com/wotlk/spell=59960/arcanum-of-blissful-mending
  3820,  // https://www.wowhead.com/wotlk/spell=59970/arcanum-of-burning-mysteries
  3817,  // https://www.wowhead.com/wotlk/spell=59954/arcanum-of-torment
  3818,  // https://www.wowhead.com/wotlk/spell=59955/arcanum-of-the-stalwart-protector
  3878, // https://www.wowhead.com/wotlk/spell=67839/mind-amplification-dish

  // Shoulder
  3836, // https://www.wowhead.com/wotlk/spell=61118/masters-inscription-of-the-crag
  3838, // https://www.wowhead.com/wotlk/spell=61120/masters-inscription-of-the-storm
  3837, // https://www.wowhead.com/wotlk/spell=61119/masters-inscription-of-the-pinnacle
  3835, // https://www.wowhead.com/wotlk/spell=61117/masters-inscription-of-the-axe

  3808, // https://www.wowhead.com/wotlk/spell=59934/greater-inscription-of-the-axe
  3811, // https://www.wowhead.com/wotlk/spell=59941/greater-inscription-of-the-pinnacle
  3810, // https://www.wowhead.com/wotlk/spell=59937/greater-inscription-of-the-storm
  3809, // https://www.wowhead.com/wotlk/spell=59936/greater-inscription-of-the-crag

  3852, // https://www.wowhead.com/wotlk/spell=62384/greater-inscription-of-the-gladiator

  // Other

  // Chest
  1953, // https://www.wowhead.com/wotlk/spell=47766/enchant-chest-greater-defense
  3245, // https://www.wowhead.com/wotlk/spell=44588/enchant-chest-exceptional-resilience
  2381, // https://www.wowhead.com/wotlk/spell=44509/enchant-chest-greater-mana-restoration
  3297, // https://www.wowhead.com/wotlk/spell=47900/enchant-chest-super-health
  3233, // https://www.wowhead.com/wotlk/spell=27958/enchant-chest-exceptional-mana
  3832, // https://www.wowhead.com/wotlk/spell=60692/enchant-chest-powerful-stats

  // Legs

  // Boots

  // Bracers
  3231, // https://www.wowhead.com/wotlk/spell=44598/enchant-bracers-expertise
  3845, // https://www.wowhead.com/wotlk/spell=44575/enchant-bracers-greater-assault
  2332, // https://www.wowhead.com/wotlk/spell=60767/enchant-bracers-superior-spellpower
  2661, // https://www.wowhead.com/wotlk/spell=44616/enchant-bracers-greater-stats
  1883, // https://www.wowhead.com/classic/spell=20008/enchant-bracer-greater-intellect
  1147, // https://www.wowhead.com/wotlk/spell=44593/enchant-bracers-major-spirit
  3850, // https://www.wowhead.com/wotlk/spell=62256/enchant-bracers-major-stamina

  3756, // https://www.wowhead.com/wotlk/spell=57683/fur-lining-attack-power
  3758, // https://www.wowhead.com/wotlk/spell=57691/fur-lining-spell-power
  3757, // https://www.wowhead.com/wotlk/spell=57690/fur-lining-stamina

  // Gloves
  3246, // https://www.wowhead.com/wotlk/spell=44592/enchant-gloves-exceptional-spellpower
  3231, // https://www.wowhead.com/wotlk/spell=44484/enchant-gloves-expertise
  3234, // https://www.wowhead.com/wotlk/spell=44488/enchant-gloves-precision
  1603, // https://www.wowhead.com/wotlk/spell=60668/enchant-gloves-crusher
  3253, // https://www.wowhead.com/wotlk/spell=44625/enchant-gloves-armsman
  3222, // https://www.wowhead.com/wotlk/spell=44529/enchant-gloves-major-agility
  3603, // https://www.wowhead.com/wotlk/spell=54998/hand-mounted-pyro-rocket
  3604, // https://www.wowhead.com/wotlk/spell=54999/hyperspeed-accelerators
  3860, // https://www.wowhead.com/wotlk/spell=63770/reticulated-armor-webbing

  // Ring

  // Cloak
  3294, // https://www.wowhead.com/wotlk/spell=47672/enchant-cloak-mighty-armor
  3831, // https://www.wowhead.com/wotlk/spell=47898/enchant-cloak-greater-speed
  1951, // https://www.wowhead.com/wotlk/spell=44591/enchant-cloak-titanweave
  3243, // https://www.wowhead.com/wotlk/spell=44582/enchant-cloak-spell-piercing
  3256, // https://www.wowhead.com/wotlk/spell=44631/enchant-cloak-shadow-armor
  3296, // https://www.wowhead.com/wotlk/spell=47899/enchant-cloak-wisdom
  983,  // https://www.wowhead.com/wotlk/spell=44500/enchant-cloak-superior-agility
  3728, // https://www.wowhead.com/wotlk/spell=55769/darkglow-embroidery
  3722, // https://www.wowhead.com/wotlk/spell=55642/lightweave-embroidery
  3730, // https://www.wowhead.com/wotlk/spell=55777/swordguard-embroidery
  3605, // https://www.wowhead.com/wotlk/spell=55002/flexweave-underlay
  3601, // flexweave-underlay, but for Spell Damage

  // Weapon
  2673, // https://tbc.wowhead.com/spell=46536/enchant-weapon-mongoose

  // 2H Weapon

  // Ranged

  // Offhand

  // Belt
  3599, // https://www.wowhead.com/wotlk/spell=54736/personal-electromagnetic-pulse-generator
  3601, // https://www.wowhead.com/wotlk/spell=54793/frag-belt
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
