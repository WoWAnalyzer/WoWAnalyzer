/**
 * All Classic Paladin spells (including talent spells) go here.
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
    icon: 'spell_holy_redemption.jpg',
  },
  AVENGING_WRATH: {
    id: 31884,
    name: 'Avenging Wrath',
    icon: 'spell_holy_avenginewrath.jpg',
  },
  BLESSING_OF_KINGS: {
    id: 20217,
    name: 'Blessing of Kings',
    icon: 'spell_magic_greaterblessingofkings.jpg',
  },
  BLESSING_OF_MIGHT: {
    id: 19740,
    name: 'Blessing of Might',
    icon: 'spell_holy_greaterblessingofkings.jpg',
  },
  BLESSING_OF_WISDOM: {
    id: 48936,
    name: 'Blessing of Wisdom',
    icon: 'spell_holy_sealofwisdom.jpg',
  },
  BLOOD_CORRUPTION: {
    id: 356110,
    name: 'Blood Corruption',
    icon: 'spell_holy_sealofvengeance.jpg',
  },
  CLEANSE: {
    id: 4987,
    name: 'Cleanse',
    icon: 'spell_holy_purify.jpg',
  },
  CONCENTRATION_AURA: {
    id: 19746,
    name: 'Concentration Aura',
    icon: 'spell_holy_mindsooth.jpg',
  },
  CONSECRATION: {
    id: 26573,
    name: 'Consecration',
    icon: 'spell_holy_innerfire.jpg',
  },
  CRUSADER_AURA: {
    id: 32223,
    name: 'Crusader Aura',
    icon: 'spell_holy_crusaderaura.jpg',
  },
  CRUSADER_STRIKE: {
    id: 35395,
    name: 'Crusader Strike',
    icon: 'spell_holy_crusaderstrike.jpg',
  },
  DEVOTION_AURA: {
    id: 465,
    name: 'Devotion Aura',
    icon: 'spell_holy_devotionaura.jpg',
  },
  DIVINE_FLAME: {
    id: 54968,
    name: 'Divine Flame',
    icon: 'spell_holy_purifyingpower.jpg',
  },
  DIVINE_PLEA: {
    id: 54428,
    name: 'Divine Plea',
    icon: 'spell_holy_aspiration.jpg',
  },
  DIVINE_PROTECTION: {
    id: 498,
    name: 'Divine Protection',
    icon: 'spell_holy_divineprotection.jpg',
  },
  DIVINE_SHIELD: {
    id: 642,
    name: 'Divine Shield',
    icon: 'spell_holy_divineshield.jpg',
  },
  EXORCISM: {
    id: 879,
    name: 'Exorcism',
    icon: 'spell_holy_excorcism_02.jpg',
  },
  FLASH_OF_LIGHT: {
    id: 19750,
    name: 'Flash of Light',
    icon: 'spell_holy_flashheal.jpg',
  },
  GUARDIAN_OF_ANCIENT_KINGS: {
    id: 86150,
    name: 'Guardian of Ancient Kings',
    icon: 'spell_holy_heroism.jpg',
  },
  HAMMER_OF_JUSTICE: {
    id: 853,
    name: 'Hammer of Justice',
    icon: 'spell_holy_sealofmight.jpg',
  },
  HAMMER_OF_WRATH: {
    id: 24275,
    name: 'Hammer of Wrath',
    icon: 'inv_hammer_04.jpg',
  },
  HAND_OF_FREEDOM: {
    id: 1044,
    name: 'Hand of Freedom',
    icon: 'spell_holy_sealofvalor.jpg',
  },
  HAND_OF_PROTECTION: {
    id: 1022,
    name: 'Hand of Protection',
    icon: 'spell_holy_sealofprotection.jpg',
  },
  HAND_OF_RECKONING: {
    id: 62124,
    name: 'Hand of Reckoning',
    icon: 'spell_holy_unyieldingfaith.jpg',
  },
  HAND_OF_SACRIFICE: {
    id: 6940,
    name: 'Hand of Sacrifice',
    icon: 'spell_holy_sealofsacrifice.jpg',
  },
  HAND_OF_SALVATION: {
    id: 1038,
    name: 'Hand of Salvation',
    icon: 'spell_holy_sealofsalvation.jpg',
  },
  HOLY_LIGHT: {
    id: 635,
    name: 'Holy Light',
    icon: 'spell_holy_holybolt.jpg',
  },
  HOLY_RADIANCE: {
    id: 82327,
    name: 'Holy Radiance',
    icon: 'spell_paladin_divinecircle.jpg',
  },
  HOLY_WRATH: {
    id: 2812,
    name: 'Holy Wrath',
    icon: 'spell_holy_purifyingpower.jpg',
  },
  INQUISITION: {
    id: 84963,
    name: 'Inquisition',
    icon: 'spell_paladin_inquisition.jpg',
  },
  JUDGEMENT: {
    id: 20271,
    name: 'Judgement',
    icon: 'spell_holy_righteousfury.jpg',
  },
  LAY_ON_HANDS: {
    id: 633,
    name: 'Lay on Hands',
    icon: 'spell_holy_layonhands.jpg',
  },
  REBUKE: {
    id: 96231,
    name: 'Rebuke',
    icon: 'spell_holy_rebuke.jpg',
  },
  REDEMPTION: {
    id: 7328,
    name: 'Redemption',
    icon: 'spell_holy_resurrection.jpg',
  },
  RESISTANCE_AURA: {
    id: 19891,
    name: 'Resistance Aura',
    icon: 'spell_fire_sealoffire.jpg',
  },
  RETRIBUTION_AURA: {
    id: 7294,
    name: 'Retribution Aura',
    icon: 'spell_holy_auraoflight.jpg',
  },
  RIGHTEOUS_DEFENSE: {
    id: 31789,
    name: 'Righteous Defense',
    icon: 'inv_shoulder_37.jpg',
  },
  RIGHTEOUS_FURY: {
    id: 25780,
    name: 'Righteous Fury',
    icon: 'spell_holy_sealoffury.jpg',
  },
  SEAL_OF_CORRUPTION: {
    id: 348704,
    name: 'Seal of Corruption',
    icon: 'spell_holy_sealofvengeance.jpg',
  },
  SEAL_OF_INSIGHT: {
    id: 20165,
    name: 'Seal of Insight',
    icon: 'spell_holy_healingaura.jpg',
  },
  SEAL_OF_JUSTICE: {
    id: 20164,
    name: 'Seal of Justice',
    icon: 'spell_holy_sealofwrath.jpg',
  },
  SEAL_OF_RIGHTEOUSNESS: {
    id: 20154,
    name: 'Seal of Righteousness',
    icon: 'spell_holy_righteousnessaura.jpg',
  },
  SEAL_OF_TRUTH: {
    id: 31801,
    name: 'Seal of Truth',
    icon: 'spell_holy_sealofvengeance.jpg',
  },
  TURN_EVIL: {
    id: 10326,
    name: 'Turn Evil',
    icon: 'spell_holy_turnundead.jpg',
  },
  WORD_OF_GLORY: {
    id: 85673,
    name: 'Word of Glory',
    icon: 'inv_helmet_96.jpg',
  },

  // ---------
  // TALENTS
  // ---------

  // Holy
  AURA_MASTERY: {
    id: 31821,
    name: 'Aura Mastery',
    icon: 'spell_holy_auramastery.jpg',
  },
  BEACON_OF_LIGHT: {
    id: 53563,
    name: 'Beacon of Light',
    icon: 'ability_paladin_beaconoflight.jpg',
  },
  DIVINE_GUARDIAN: {
    id: 70940,
    name: 'Divine Guardian',
    icon: 'spell_holy_powerwordbarrier.jpg',
  },
  DIVINE_FAVOR: {
    id: 31842,
    name: 'Divine Favor',
    icon: 'spell_holy_divineillumination.jpg',
  },
  HOLY_SHOCK: {
    id: 20473,
    name: 'Holy Shock',
    icon: 'spell_holy_searinglight.jpg',
  },
  JUDGEMENTS_OF_THE_PURE_R1: {
    id: 53655,
    name: 'Judgements of the Pure',
    icon: 'ability_paladin_judgementofthepure.jpg',
  },
  JUDGEMENTS_OF_THE_PURE_R2: {
    id: 53656,
    name: 'Judgements of the Pure',
    icon: 'ability_paladin_judgementofthepure.jpg',
  },
  JUDGEMENTS_OF_THE_PURE_R3: {
    id: 53657,
    name: 'Judgements of the Pure',
    icon: 'ability_paladin_judgementofthepure.jpg',
  },
  LIGHT_OF_DAWN: {
    id: 85222,
    name: 'Light of Dawn',
    icon: 'spell_paladin_lightofdawn.jpg',
  },
  // Protection
  ARDENT_DEFENDER: {
    id: 31850,
    name: 'Ardent Defender',
    icon: 'spell_holy_avengersshield.jpg',
  },
  AVENGERS_SHIELD: {
    id: 31935,
    name: "Avenger's Shield",
    icon: 'spell_holy_avengersshield.jpg',
  },
  BLESSING_OF_SANCTUARY: {
    id: 20911,
    name: 'Blessing of Sanctuary',
    icon: 'spell_nature_lightningshield.jpg',
  },
  DIVINE_SACRIFICE: {
    id: 64205,
    name: 'Divine Sacrifice',
    icon: 'spell_holy_powerwordbarrier.jpg',
  },
  HAMMER_OF_THE_RIGHTEOUS: {
    id: 53595,
    name: 'Hammer of the Righteous',
    icon: 'ability_paladin_hammeroftherighteous.jpg',
  },
  HOLY_SHIELD: {
    id: 20925,
    name: 'Holy Shield',
    icon: 'classic_spell_holy_blessingofprotection.jpg',
  },
  SHIELD_OF_THE_RIGHTEOUS: {
    id: 53600,
    name: 'Shield of the Righteous',
    icon: 'ability_paladin_shieldofvengeance.jpg',
  },
  // Retribution
  DIVINE_STORM: {
    id: 53385,
    name: 'Divine Storm',
    icon: 'ability_paladin_divinestorm.jpg',
  },
  JUDGEMENTS_OF_THE_BOLD: {
    id: 89901,
    name: 'Judgements of the Bold',
    icon: 'ability_paladin_judgementofthewise.jpg',
  },
  REPENTANCE: {
    id: 20066,
    name: 'Repentance',
    icon: 'spell_holy_prayerofhealing.jpg',
  },
  SACRED_SHIELD: {
    id: 85285,
    name: 'Sacred Shield',
    icon: 'ability_paladin_blessedmending.jpg',
  },
  SANCTIFIED_RETRIBUTION: {
    id: 31869,
    name: 'Sanctified Retribution',
    icon: 'spell_holy_mindvision.jpg',
  },
  TEMPLARS_VERDICT: {
    id: 85256,
    name: 'Templars Verdict',
    icon: 'spell_paladin_templarsverdict.jpg',
  },
  ZEALOTRY: {
    id: 85696,
    name: 'Zealotry',
    icon: 'spell_holy_proclaimchampion_02.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
