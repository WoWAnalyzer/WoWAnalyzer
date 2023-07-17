/**
 * All WotLK Paladin spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------
  AVENGING_WRATH: {
    id: 31884,
    name: 'Avenging Wrath',
    icon: 'spell_holy_avenginewrath',
  },
  BLESSING_OF_KINGS: {
    id: 20217,
    name: 'Blessing of Kings',
    icon: 'spell_magic_magearmor',
  },
  BLESSING_OF_MIGHT: {
    id: 48932,
    name: 'Blessing of Might',
    icon: 'spell_holy_fistofjustice',
    lowRanks: [48931, 27140, 25291, 19838, 19837, 19836, 19835, 19834, 19740],
  },
  BLESSING_OF_WISDOM: {
    id: 48936,
    name: 'Blessing of Wisdom',
    icon: 'spell_holy_sealofwisdom',
    lowRanks: [48935, 27142, 25290, 19854, 19853, 19852, 19850, 19742],
  },
  BLOOD_CORRUPTION: {
    id: 356110,
    name: 'Blood Corruption',
    icon: 'spell_holy_sealofvengeance',
  },
  CLEANSE: {
    id: 4987,
    name: 'Cleanse',
    icon: 'spell_holy_renew',
  },
  CONCENTRATION_AURA: {
    id: 19746,
    name: 'Concentration Aura',
    icon: 'spell_holy_mindsooth',
  },
  CONSECRATION: {
    id: 48819,
    name: 'Consecration',
    icon: 'spell_holy_innerfire',
    lowRanks: [48818, 27173, 20924, 20923, 20922, 20116, 26573],
  },
  CRUSADER_AURA: {
    id: 32223,
    name: 'Crusader Aura',
    icon: 'spell_holy_crusaderaura',
  },
  DEVOTION_AURA: {
    id: 48942,
    name: 'Devotion Aura',
    icon: 'spell_holy_devotionaura',
    lowRanks: [48941, 27149, 10293, 10292, 1032, 10291, 643, 10290, 465],
  },
  DIVINE_INTERVENTION: {
    id: 19752,
    name: 'Divine Intervention',
    icon: 'spell_nature_timestop',
  },
  DIVINE_PLEA: {
    id: 54428,
    name: 'Divine Plea',
    icon: 'spell_holy_aspiration',
  },
  DIVINE_PROTECTION: {
    id: 498,
    name: 'Divine Protection',
    icon: 'spell_holy_restoration',
  },
  DIVINE_SHIELD: {
    id: 642,
    name: 'Divine Shield',
    icon: 'spell_holy_divineintervention',
  },
  EXORCISM: {
    id: 48801,
    name: 'Exorcism',
    icon: 'spell_holy_excorcism_02',
    lowRanks: [48800, 27138, 10314, 10313, 10312, 5615, 5614, 879],
  },
  FIRE_RESISTANCE_AURA: {
    id: 48947,
    name: 'Fire Resistance Aura',
    icon: 'spell_fire_sealoffire',
    lowRanks: [27153, 19900, 19899, 19891],
  },
  FLASH_OF_LIGHT: {
    id: 48785,
    name: 'Flash of Light',
    icon: 'spell_holy_flashheal',
    lowRanks: [48784, 27137, 19943, 19942, 19941, 19940, 19939, 19750],
  },
  FROST_RESISTANCE_AURA: {
    id: 48945,
    name: 'Frost Resistance Aura',
    icon: 'spell_frost_wizardmark',
    lowRanks: [27152, 19898, 19897, 19888],
  },
  GLYPH_OF_HOLY_LIGHT: {
    id: 54968,
    name: 'Glyph of Holy Light',
    icon: 'inv_glyph_majorpaladin',
  },
  GREATER_BLESSING_OF_KINGS: {
    id: 25898,
    name: 'Greater Blessing of Kings',
    icon: 'spell_magic_greaterblessingofkings',
  },
  GREATER_BLESSING_OF_MIGHT: {
    id: 48934,
    name: 'Greater Blessing of Might',
    icon: 'spell_holy_greaterblessingofkings',
    lowRanks: [48933, 27141, 25916, 25782],
  },
  GREATER_BLESSING_OF_SANCTUARY: {
    id: 25899,
    name: 'Greater Blessing of Sanctuary',
    icon: 'spell_holy_greaterblessingofsanctuary',
  },
  GREATER_BLESSING_OF_WISDOM: {
    id: 48938,
    name: 'Greater Blessing of Wisdom',
    icon: 'spell_holy_greaterblessingofwisdom',
    lowRanks: [48937, 27143, 25918, 25894],
  },
  HAMMER_OF_JUSTICE: {
    id: 10308,
    name: 'Hammer of Justice',
    icon: 'spell_holy_sealofmight',
    lowRanks: [5589, 5588, 853],
  },
  HAMMER_OF_WRATH: {
    id: 48806,
    name: 'Hammer of Wrath',
    icon: 'ability_thunderclap',
    lowRanks: [48805, 27180, 24239, 24274, 24275],
  },
  HAND_OF_FREEDOM: {
    id: 1044,
    name: 'Hand of Freedom',
    icon: 'spell_holy_sealofvalor',
  },
  HAND_OF_PROTECTION: {
    id: 10278,
    name: 'Hand of Protection',
    icon: 'spell_holy_sealofprotection',
    lowRanks: [5599, 1022],
  },
  HAND_OF_RECKONING: {
    id: 62124,
    name: 'Hand of Reckoning',
    icon: 'spell_holy_unyieldingfaith',
  },
  HAND_OF_SACRIFICE: {
    id: 6940,
    name: 'Hand of Sacrifice',
    icon: 'spell_holy_sealofsacrifice',
  },
  HAND_OF_SALVATION: {
    id: 1038,
    name: 'Hand of Salvation',
    icon: 'spell_holy_sealofsalvation',
  },
  HOLY_LIGHT: {
    id: 48782,
    name: 'Holy Light',
    icon: 'spell_holy_holybolt',
    lowRanks: [48781, 27136, 27135, 25292, 10329, 10328, 3472, 1042, 1026, 647, 639, 635],
  },
  HOLY_WRATH: {
    id: 48817,
    name: 'Holy Wrath',
    icon: 'spell_holy_excorcism',
    lowRanks: [48816, 27139, 10318, 2812],
  },
  JUDGEMENT_OF_CORRUPTION: {
    id: 356112,
    name: 'Judgement of Corruption',
    icon: 'spell_holy_sealofvengeance',
  },
  JUDGEMENT_OF_JUSTICE: {
    id: 53407,
    name: 'Judgement of Justice',
    icon: 'ability_paladin_judgementred',
  },
  JUDGEMENT_OF_LIGHT: {
    id: 20271,
    name: 'Judgement of Light',
    icon: 'spell_holy_righteousfury',
  },
  JUDGEMENT_OF_WISDOM: {
    id: 53408,
    name: 'Judgement of Wisdom',
    icon: 'ability_paladin_judgementblue',
  },
  LAY_ON_HANDS: {
    id: 48788,
    name: 'Lay on Hands',
    icon: 'spell_holy_layonhands',
    lowRanks: [27154, 10310, 2800, 633],
  },
  PURIFY: {
    id: 1152,
    name: 'Purify',
    icon: 'spell_holy_purify',
  },
  REDEMPTION: {
    id: 48950,
    name: 'Redemption',
    icon: 'spell_holy_resurrection',
    lowRanks: [48949, 20773, 20772, 10324, 10322, 7328],
  },
  RETRIBUTION_AURA: {
    id: 54043,
    name: 'Retribution Aura',
    icon: 'spell_holy_auraoflight',
    lowRanks: [27150, 10301, 10300, 10299, 10298, 7294],
  },
  RIGHTEOUS_DEFENSE: {
    id: 31789,
    name: 'Righteous Defense',
    icon: 'inv_shoulder_37',
  },
  RIGHTEOUS_FURY: {
    id: 25780,
    name: 'Righteous Fury',
    icon: 'spell_holy_sealoffury',
  },
  SACRED_SHIELD: {
    id: 53601,
    name: 'Sacred Shield',
    icon: 'ability_paladin_blessedmending',
  },
  SEAL_OF_BLOOD: {
    id: 31892,
    name: 'Seal of Blood',
    icon: 'spell_holy_sealofblood',
  },
  SEAL_OF_CORRUPTION: {
    id: 348704,
    name: 'Seal of Corruption',
    icon: 'spell_holy_sealofvengeance',
  },
  SEAL_OF_JUSTICE: {
    id: 20164,
    name: 'Seal of Justice',
    icon: 'spell_holy_sealofwrath',
  },
  SEAL_OF_LIGHT: {
    id: 20165,
    name: 'Seal of Light',
    icon: 'spell_holy_healingaura',
  },
  SEAL_OF_RIGHTEOUSNESS: {
    id: 21084,
    name: 'Seal of Righteousness',
    icon: 'ability_thunderbolt',
    lowRanks: [20154],
  },
  SEAL_OF_THE_MARTYR: {
    id: 348700,
    name: 'Seal of the Martyr',
    icon: 'spell_holy_sealofblood',
    lowRanks: [53720],
  },
  SEAL_OF_VENGEANCE: {
    id: 31801,
    name: 'Seal of Vengeance',
    icon: 'spell_holy_sealofvengeance',
  },
  SEAL_OF_WISDOM: {
    id: 20166,
    name: 'Seal of Wisdom',
    icon: 'spell_holy_righteousnessaura',
  },
  SEARING_LIGHT: {
    id: 65120,
    name: 'Searing Light',
    icon: 'ability_paladin_infusionoflight',
  },
  SENSE_UNDEAD: {
    id: 5502,
    name: 'Sense Undead',
    icon: 'spell_holy_senseundead',
  },
  SHADOW_RESISTANCE_AURA: {
    id: 48943,
    name: 'Shadow Resistance Aura',
    icon: 'spell_shadow_sealofkings',
    lowRanks: [27151, 19896, 19895, 19876],
  },
  SHIELD_OF_RIGHTEOUSNESS: {
    id: 61411,
    name: 'Shield of Righteousness',
    icon: 'ability_paladin_shieldofvengeance',
    lowRanks: [53600],
  },
  TURN_EVIL: {
    id: 10326,
    name: 'Turn Evil',
    icon: 'spell_holy_turnundead',
  },

  // ---------
  // TALENTS
  // ---------

  // Holy
  AURA_MASTERY: {
    id: 31821,
    name: 'Aura Mastery',
    icon: 'spell_holy_auramastery',
  },
  BEACON_OF_LIGHT: {
    id: 53563,
    name: 'Beacon of Light',
    icon: 'ability_paladin_beaconoflight',
  },
  DIVINE_FAVOR: {
    id: 20216,
    name: 'Divine Favor',
    icon: 'spell_holy_heal',
  },
  DIVINE_ILLUMINATION: {
    id: 31842,
    name: 'Divine Illumination',
    icon: 'spell_holy_divineillumination',
  },
  HOLY_SHOCK: {
    id: 48825,
    name: 'Holy Shock',
    icon: 'spell_holy_searinglight',
    lowRanks: [48824, 33072, 27174, 20930, 20929, 20473],
  },
  JUDGEMENTS_OF_THE_PURE: {
    id: 54153,
    name: 'Judgements of the Pure',
    icon: 'ability_paladin_judgementofthepure',
  },
  // Protection
  AVENGERS_SHIELD: {
    id: 48827,
    name: "Avenger's Shield",
    icon: 'spell_holy_avengersshield',
    lowRanks: [48826, 32700, 32699, 31935],
  },
  BLESSING_OF_SANCTUARY: {
    id: 20911,
    name: 'Blessing of Sanctuary',
    icon: 'spell_nature_lightningshield',
  },
  DIVINE_SACRIFICE: {
    id: 64205,
    name: 'Divine Sacrifice',
    icon: 'spell_holy_powerwordbarrier',
  },
  HAMMER_OF_THE_RIGHTEOUS: {
    id: 53595,
    name: 'Hammer of the Righteous',
    icon: 'ability_paladin_hammeroftherighteous',
  },
  HOLY_SHIELD: {
    id: 48952,
    name: 'Holy Shield',
    icon: 'classic_spell_holy_blessingofprotection',
    lowRanks: [48951, 27179, 20928, 20927, 20925],
  },
  // Retribution
  CRUSADER_STRIKE: {
    id: 35395,
    name: 'Crusader Strike',
    icon: 'spell_holy_crusaderstrike',
  },
  DIVINE_STORM: {
    id: 53385,
    name: 'Divine Storm',
    icon: 'ability_paladin_divinestorm',
  },
  REPENTANCE: {
    id: 20066,
    name: 'Repentance',
    icon: 'spell_holy_prayerofhealing',
  },
  SANCTIFIED_RETRIBUTION: {
    id: 31869,
    name: 'Sanctified Retribution',
    icon: 'spell_holy_mindvision',
  },
  SEAL_OF_COMMAND: {
    id: 20375,
    name: 'Seal of Command',
    icon: 'ability_warrior_innerrage',
  },
  SEAL_OF_COMMAND_DMG: {
    id: 20424,
    name: 'Seal of Command',
    icon: 'ability_warrior_innerrage',
  },
} satisfies Record<string, Spell>;

export default spells;
