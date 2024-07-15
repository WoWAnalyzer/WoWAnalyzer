/**
 * All Cata Paladin spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------
  ABSOLUTION: {
    id: 450761,
    name: 'Absolution',
    icon: 'spell_holy_redemption',
  },
  AVENGING_WRATH: {
    id: 31884,
    name: 'Avenging Wrath',
    icon: 'spell_holy_avenginewrath',
  },
  BLESSING_OF_KINGS: {
    id: 20217,
    name: 'Blessing of Kings',
    icon: 'spell_magic_greaterblessingofkings',
  },
  BLESSING_OF_MIGHT: {
    id: 19740,
    name: 'Blessing of Might',
    icon: 'spell_holy_greaterblessingofkings',
  },
  BLESSING_OF_WISDOM: {
    id: 48936,
    name: 'Blessing of Wisdom',
    icon: 'spell_holy_sealofwisdom',
  },
  BLOOD_CORRUPTION: {
    id: 356110,
    name: 'Blood Corruption',
    icon: 'spell_holy_sealofvengeance',
  },
  CLEANSE: {
    id: 4987,
    name: 'Cleanse',
    icon: 'spell_holy_purify',
  },
  CONCENTRATION_AURA: {
    id: 19746,
    name: 'Concentration Aura',
    icon: 'spell_holy_mindsooth',
  },
  CONSECRATION: {
    id: 26573,
    name: 'Consecration',
    icon: 'spell_holy_innerfire',
  },
  CRUSADER_AURA: {
    id: 32223,
    name: 'Crusader Aura',
    icon: 'spell_holy_crusaderaura',
  },
  CRUSADER_STRIKE: {
    id: 35395,
    name: 'Crusader Strike',
    icon: 'spell_holy_crusaderstrike',
  },
  DEVOTION_AURA: {
    id: 465,
    name: 'Devotion Aura',
    icon: 'spell_holy_devotionaura',
  },
  DIVINE_FLAME: {
    id: 54968,
    name: 'Divine Flame',
    icon: 'spell_holy_purifyingpower',
  },
  DIVINE_PLEA: {
    id: 54428,
    name: 'Divine Plea',
    icon: 'spell_holy_aspiration',
  },
  DIVINE_PROTECTION: {
    id: 498,
    name: 'Divine Protection',
    icon: 'spell_holy_divineprotection',
  },
  DIVINE_SHIELD: {
    id: 642,
    name: 'Divine Shield',
    icon: 'spell_holy_divineshield',
  },
  EXORCISM: {
    id: 879,
    name: 'Exorcism',
    icon: 'spell_holy_excorcism_02',
  },
  FLASH_OF_LIGHT: {
    id: 19750,
    name: 'Flash of Light',
    icon: 'spell_holy_flashheal',
  },
  GUARDIAN_OF_ANCIENT_KINGS: {
    id: 86150,
    name: 'Guardian of Ancient Kings',
    icon: 'spell_holy_heroism',
  },
  HAMMER_OF_JUSTICE: {
    id: 853,
    name: 'Hammer of Justice',
    icon: 'spell_holy_sealofmight',
  },
  HAMMER_OF_WRATH: {
    id: 24275,
    name: 'Hammer of Wrath',
    icon: 'inv_hammer_04',
  },
  HAND_OF_FREEDOM: {
    id: 1044,
    name: 'Hand of Freedom',
    icon: 'spell_holy_sealofvalor',
  },
  HAND_OF_PROTECTION: {
    id: 1022,
    name: 'Hand of Protection',
    icon: 'spell_holy_sealofprotection',
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
    id: 635,
    name: 'Holy Light',
    icon: 'spell_holy_holybolt',
  },
  HOLY_RADIANCE: {
    id: 82327,
    name: 'Holy Radiance',
    icon: 'spell_paladin_divinecircle',
  },
  HOLY_WRATH: {
    id: 2812,
    name: 'Holy Wrath',
    icon: 'spell_holy_purifyingpower',
  },
  INQUISITION: {
    id: 84963,
    name: 'Inquisition',
    icon: 'spell_paladin_inquisition',
  },
  JUDGEMENT: {
    id: 20271,
    name: 'Judgement',
    icon: 'spell_holy_righteousfury',
  },
  LAY_ON_HANDS: {
    id: 633,
    name: 'Lay on Hands',
    icon: 'spell_holy_layonhands',
  },
  REBUKE: {
    id: 96231,
    name: 'Rebuke',
    icon: 'spell_holy_rebuke',
  },
  REDEMPTION: {
    id: 7328,
    name: 'Redemption',
    icon: 'spell_holy_resurrection',
  },
  RESISTANCE_AURA: {
    id: 19891,
    name: 'Resistance Aura',
    icon: 'spell_fire_sealoffire',
  },
  RETRIBUTION_AURA: {
    id: 7294,
    name: 'Retribution Aura',
    icon: 'spell_holy_auraoflight',
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
  SEAL_OF_CORRUPTION: {
    id: 348704,
    name: 'Seal of Corruption',
    icon: 'spell_holy_sealofvengeance',
  },
  SEAL_OF_INSIGHT: {
    id: 20165,
    name: 'Seal of Insight',
    icon: 'spell_holy_healingaura',
  },
  SEAL_OF_JUSTICE: {
    id: 20164,
    name: 'Seal of Justice',
    icon: 'spell_holy_sealofwrath',
  },
  SEAL_OF_RIGHTEOUSNESS: {
    id: 20154,
    name: 'Seal of Righteousness',
    icon: 'spell_holy_righteousnessaura',
  },
  SEAL_OF_TRUTH: {
    id: 31801,
    name: 'Seal of Truth',
    icon: 'spell_holy_sealofvengeance',
  },
  TURN_EVIL: {
    id: 10326,
    name: 'Turn Evil',
    icon: 'spell_holy_turnundead',
  },
  WORD_OF_GLORY: {
    id: 85673,
    name: 'Word of Glory',
    icon: 'inv_helmet_96',
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
  DIVINE_GUARDIAN: {
    id: 70940,
    name: 'Divine Guardian',
    icon: 'spell_holy_powerwordbarrier',
  },
  DIVINE_FAVOR: {
    id: 31842,
    name: 'Divine Favor',
    icon: 'spell_holy_divineillumination',
  },
  HOLY_SHOCK: {
    id: 20473,
    name: 'Holy Shock',
    icon: 'spell_holy_searinglight',
  },
  JUDGEMENTS_OF_THE_PURE: {
    id: 54153,
    name: 'Judgements of the Pure',
    icon: 'ability_paladin_judgementofthepure',
  },
  LIGHT_OF_DAWN: {
    id: 85222,
    name: 'Light of Dawn',
    icon: 'spell_paladin_lightofdawn',
  },
  // Protection
  ARDENT_DEFENDER: {
    id: 31850,
    name: 'Ardent Defender',
    icon: 'spell_holy_avengersshield',
  },
  AVENGERS_SHIELD: {
    id: 31935,
    name: "Avenger's Shield",
    icon: 'spell_holy_avengersshield',
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
    id: 20925,
    name: 'Holy Shield',
    icon: 'classic_spell_holy_blessingofprotection',
  },
  SHIELD_OF_THE_RIGHTEOUS: {
    id: 53600,
    name: 'Shield of the Righteous',
    icon: 'ability_paladin_shieldofvengeance',
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
  JUDGEMENTS_OF_THE_BOLD: {
    id: 89901,
    name: 'Judgements of the Bold',
    icon: 'ability_paladin_judgementofthewise',
  },
  REPENTANCE: {
    id: 20066,
    name: 'Repentance',
    icon: 'spell_holy_prayerofhealing',
  },
  SACRED_SHIELD: {
    id: 85285,
    name: 'Sacred Shield',
    icon: 'ability_paladin_blessedmending',
  },
  SANCTIFIED_RETRIBUTION: {
    id: 31869,
    name: 'Sanctified Retribution',
    icon: 'spell_holy_mindvision',
  },
  TEMPLARS_VERDICT: {
    id: 85256,
    name: 'Templars Verdict',
    icon: 'spell_paladin_templarsverdict',
  },
  ZEALOTRY: {
    id: 85696,
    name: 'Zealotry',
    icon: 'spell_holy_proclaimchampion_02',
  },

  // ---------
  // SHARED Removed From Cata
  // ---------

  DIVINE_INTERVENTION: {
    id: 19752,
    name: 'Divine Intervention',
    icon: 'spell_nature_timestop',
  },
  FROST_RESISTANCE_AURA: {
    id: 48945,
    name: 'Frost Resistance Aura',
    icon: 'spell_frost_wizardmark',
    lowRanks: [27152, 19898, 19897, 19888],
  },
  GLYPH_OF_HOLY_LIGHT: {
    id: 54969,
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
  JUDGEMENT_OF_WISDOM: {
    id: 53408,
    name: 'Judgement of Wisdom',
    icon: 'ability_paladin_judgementblue',
  },
  PURIFY: {
    id: 1152,
    name: 'Purify',
    icon: 'spell_holy_purify',
  },
  SEAL_OF_BLOOD: {
    id: 31892,
    name: 'Seal of Blood',
    icon: 'spell_holy_sealofblood',
  },
  SEAL_OF_THE_MARTYR: {
    id: 348700,
    name: 'Seal of the Martyr',
    icon: 'spell_holy_sealofblood',
    lowRanks: [53720],
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

  // ---------
  // TALENTS Removed From Cata
  // ---------

  DIVINE_ILLUMINATION: {
    id: 20216,
    name: 'Divine Illumination',
    icon: 'spell_holy_heal',
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
