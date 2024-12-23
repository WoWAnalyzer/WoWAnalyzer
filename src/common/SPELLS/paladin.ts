/**
 * All Paladin abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';

const spells = {
  // Paladin:
  CRUSADER_STRIKE: {
    id: 35395,
    name: 'Crusader Strike',
    icon: 'spell_holy_crusaderstrike',
  },
  JUDGMENT_CAST: {
    id: 20271,
    name: 'Judgment',
    icon: 'spell_holy_righteousfury',
    manaCost: 1500,
  },
  JUDGMENT_CAST_HOLY: {
    id: 275773,
    name: 'Judgment',
    icon: 'spell_holy_righteousfury',
    manaCost: 6000,
  },
  JUDGMENT_CAST_PROTECTION: {
    id: 275779,
    name: 'Judgment',
    icon: 'spell_holy_righteousfury',
  },
  JUDGMENT_HP_ENERGIZE: {
    id: 220637,
    name: 'Judgment',
    icon: 'spell_holy_righteousfury',
    manaCost: 300,
  },
  DIVINE_STEED: {
    id: 190784,
    name: 'Divine Steed',
    icon: 'ability_paladin_divinesteed',
  },
  DIVINE_STEED_BUFF: {
    id: 221883,
    name: 'Divine Steed',
    icon: 'ability_paladin_divinesteed',
  },
  DIVINE_STEED_BUFF_ALT: {
    // probably class mount glyph
    id: 254471,
    name: 'Divine Steed',
    icon: 'ability_paladin_divinesteed',
  },
  DIVINE_STEED_BUFF_ALT_2: {
    // probably class mount glyph - https://www.warcraftlogs.com/reports/4DWRHk73Vvt1wmz2/#fight=22&type=auras&source=20
    id: 276112,
    name: 'Divine Steed',
    icon: 'ability_paladin_divinesteed',
  },
  DIVINE_STEED_BUFF_ALT_3: {
    // Silvermoon charger I think - https://www.warcraftlogs.com/reports/TrfWp1jHdRtQDqkx/#fight=2&source=37&type=auras
    id: 221886,
    name: 'Divine Steed',
    icon: 'ability_paladin_divinesteed',
  },
  HAND_OF_RECKONING: {
    id: 62124,
    name: 'Hand of Reckoning',
    icon: 'spell_holy_unyieldingfaith',
  },
  HAMMER_OF_JUSTICE: {
    id: 853,
    name: 'Hammer of Justice',
    icon: 'spell_holy_sealofmight',
  },
  WORD_OF_GLORY: {
    id: 85673,
    name: 'Word of Glory',
    icon: 'inv_helmet_96',
  },
  CRUSADER_AURA: {
    id: 32223,
    name: 'Crusader Aura',
    icon: 'spell_holy_crusaderaura',
  },
  RETRIBUTION_AURA: {
    id: 183435,
    name: 'Retribution Aura',
    icon: 'spell_holy_crusade',
  },
  CONCENTRATION_AURA: {
    id: 317920,
    name: 'Concentration Aura',
    icon: 'spell_holy_mindsooth',
  },
  DEVOTION_AURA: {
    id: 465,
    name: 'Devotion Aura',
    icon: 'spell_holy_devotionaura',
  },
  SENSE_UNDEAD: {
    id: 5502,
    name: 'Sense Undead',
    icon: 'spell_holy_senseundead',
  },
  BLESSING_OF_DUSK: {
    id: 385126,
    name: 'Blessing of Dusk',
    icon: 'achievement_zone_newshadowmoonvalley',
  },
  BLESSING_OF_DAWN: {
    id: 385127,
    name: 'Blessing of Dawn',
    icon: 'achievement_zone_valeofeternalblossoms',
  },
  RELENTLESS_INQUISITOR_TALENT_BUFF: {
    id: 383389,
    name: 'Relentless Inquisitor',
    icon: 'spell_holy_mindvision',
  },
  DIVINE_PROTECTION: {
    id: 498,
    name: 'Divine Protection',
    icon: 'spell_holy_divineprotection',
    manaCost: 1750,
  },
  HOLY_LIGHT: {
    id: 82326,
    name: 'Holy Light',
    icon: 'spell_holy_surgeoflight',
    manaCost: 6000,
  },

  // Holy Paladin:
  MASTERY_LIGHTBRINGER: {
    id: 183997,
    name: 'Mastery: Lightbringer',
    icon: 'inv_hammer_04',
  },
  BEACON_OF_LIGHT_HEAL: {
    id: 53652,
    name: 'Beacon of Light',
    icon: 'ability_paladin_beaconoflight',
  },
  BEACON_OF_LIGHT_CAST_AND_BUFF: {
    id: 53563,
    name: 'Beacon of Light',
    icon: 'ability_paladin_beaconoflight',
    manaCost: 250,
  },
  FLASH_OF_LIGHT: {
    id: 19750,
    name: 'Flash of Light',
    icon: 'spell_holy_flashheal',
    manaCost: 2200,
  },
  HOLY_SHOCK_HEAL: {
    id: 25914,
    name: 'Holy Shock',
    icon: 'spell_holy_searinglight',
  },
  HOLY_SHOCK_DAMAGE: {
    id: 25912,
    name: 'Holy Shock',
    icon: 'spell_holy_searinglight',
  },
  LIGHT_OF_DAWN_HEAL: {
    id: 225311,
    name: 'Light of Dawn',
    icon: 'spell_paladin_lightofdawn',
  },
  LIGHT_OF_THE_MARTYR_DAMAGE_TAKEN: {
    id: 196917,
    name: 'Light of the Martyr',
    icon: 'ability_paladin_lightofthemartyr',
  },
  HOLY_PRISM_HEAL_DIRECT: {
    id: 114871,
    name: 'Holy Prism',
    icon: 'spell_paladin_holyprism',
  },
  HOLY_PRISM_HEAL: {
    id: 114852,
    name: 'Holy Prism',
    icon: 'spell_paladin_holyprism',
  },
  JUDGMENT_OF_LIGHT_HEAL: {
    id: 183811,
    name: 'Judgment of Light',
    icon: 'spell_holy_divineprovidence',
  },
  AURA_MASTERY: {
    id: 31821,
    name: 'Aura Mastery',
    icon: 'spell_holy_auramastery',
  },
  AURA_OF_MERCY_HEAL: {
    id: 210291,
    name: 'Aura of Mercy',
    icon: 'spell_holy_blessedlife',
  },
  AURA_OF_SACRIFICE_HEAL: {
    id: 210383,
    name: 'Aura of Sacrifice',
    icon: 'ability_deathwing_bloodcorruption_earth',
  },
  AURA_OF_SACRIFICE_TRANSFER: {
    id: 210380,
    name: 'Aura of Sacrifice',
    icon: 'ability_deathwing_bloodcorruption_earth',
  },
  AURA_OF_SACRIFICE_BUFF: {
    id: 210372,
    name: 'Aura of Sacrifice',
    icon: 'ability_deathwing_bloodcorruption_earth',
  },
  INFUSION_OF_LIGHT: {
    id: 54149,
    name: 'Infusion of Light',
    icon: 'ability_paladin_infusionoflight',
  },
  CLEANSE: {
    id: 4987,
    name: 'Cleanse',
    icon: 'spell_holy_purify',
    manaCost: 650,
  },
  DEVOTION_AURA_BUFF: {
    id: 210320,
    name: 'Devotion Aura',
    icon: 'spell_holy_devotionaura',
  },
  AVENGING_CRUSADER_HEAL_NORMAL: {
    id: 216371,
    name: 'Avenging Crusader',
    icon: 'spell_holy_restoration',
  },
  AVENGING_CRUSADER_HEAL_CRIT: {
    id: 281465,
    name: 'Avenging Crusader',
    icon: 'spell_holy_restoration',
  },
  BESTOW_FAITH_HOLY_POWER: {
    id: 343618,
    name: 'Bestow Faith',
    icon: 'ability_paladin_blessedmending',
  },
  BEACON_OF_LIGHT_HOLY_POWER: {
    id: 88852,
    name: 'Beacon of Light',
    icon: 'ability_paladin_beaconoflight',
  },
  GOLDEN_PATH_HEAL_TALENT: {
    id: 377129,
    name: 'Golden Path',
    icon: 'ability_priest_cascade',
  },
  SEAL_OF_MERCY_HEAL_TALENT: {
    id: 384906,
    name: 'Seal of Mercy',
    icon: 'spell_holy_greaterblessingofsalvation',
  },
  UNTEMPERED_DEDICATION_BUFF: {
    id: 387815,
    name: 'Untempered Dedication',
    icon: 'achievement_admiral_of_the_light',
  },
  BLESSING_OF_SUMMER_TALENT: {
    id: 388007,
    name: 'Blessing of Summer',
    icon: 'ability_ardenweald_paladin_summer',
  },
  BLESSING_OF_AUTUMN_TALENT: {
    id: 388010,
    name: 'Blessing of Autumn',
    icon: 'ability_ardenweald_paladin_autumn',
  },
  BLESSING_OF_WINTER_TALENT: {
    id: 388011,
    name: 'Blessing of Winter',
    icon: 'ability_ardenweald_paladin_winter',
  },
  BLESSING_OF_SPRING_TALENT: {
    id: 388013,
    name: 'Blessing of Spring',
    icon: 'ability_ardenweald_paladin_spring',
  },
  SACRED_WEAPON_TALENT: {
    id: 432472,
    name: 'Sacred Weapon',
    icon: 'inv_ability_lightsmithpaladin_sacredweapon',
  },
  EMPYREAN_LEGACY_BUFF: {
    id: 387178,
    name: 'Empyrean Legacy',
    icon: 'item_holyspark',
  },
  EMPYREAN_LEGACY_DEBUFF: {
    id: 387441,
    name: 'Empyrean Legacy',
    icon: 'spell_holy_dizzy',
  },
  RECLAMATION_CAST: {
    id: 415388,
    name: 'Reclamation',
    icon: 'ability_paladin_longarmofthelaw',
  },
  DIVINE_REVELATIONS_ENERGIZE: {
    id: 387812,
    name: 'Divine Revelations',
    icon: 'ability_paladin_infusionoflight',
  },
  TYRS_DELIVERANCE_HEALING_INCREASE: {
    id: 200654,
    name: "Tyr's Deliverance",
    icon: 'inv_mace_2h_artifactsilverhand_d_01',
  },
  RESPLENDENT_LIGHT_HEAL: {
    id: 392903,
    name: 'Resplendent Light',
    icon: 'ability_priest_voidshift',
  },
  DIVINE_RESONANCE_TALENT_HOLY: {
    id: 386730,
    name: 'Divine Resonance',
    icon: 'ability_bastion_paladin',
  },
  RISING_SUNLIGHT_BUFF: {
    id: 414204,
    name: 'Rising Sunlight',
    icon: 'spell_priest_divinestar_holy',
  },
  SEAL_OF_THE_CRUSADER_HEAL: {
    id: 416771,
    name: 'Seal of the Crusader',
    icon: 'spell_holy_holysmite',
  },
  SHIELD_OF_THE_RIGHTEOUS_HOLY: {
    id: 415091,
    name: 'Shield of the Righteous',
    icon: 'ability_paladin_shieldofvengeance',
  },

  // Retribution Paladin:
  BLADE_OF_JUSTICE: {
    id: 184575,
    name: 'Blade of Justice',
    icon: 'ability_paladin_bladeofjustice',
  },
  SHIELD_OF_VENGEANCE: {
    id: 184662,
    name: 'Shield of Vengeance',
    icon: 'ability_paladin_shieldofthetemplar',
  },
  HAMMER_OF_WRATH: {
    id: 24275,
    name: 'Hammer of Wrath',
    icon: 'spell_paladin_hammerofwrath',
  },
  JUDGMENT_DEBUFF: {
    id: 197277,
    name: 'Judgment',
    icon: 'spell_holy_righteousfury',
  },
  JUDGMENT_DEBUFF_HOLY: {
    id: 214222,
    name: 'Judgment',
    icon: 'spell_holy_righteousfury',
  },
  GREATER_JUDGMENT_HEAL_HOLY: {
    id: 414019,
    name: 'Greater Judgment',
    icon: 'spell_holy_righteousfury',
  },
  TEMPLARS_VERDICT_DAMAGE: {
    id: 224266,
    name: "Templar's Verdict",
    icon: 'spell_paladin_templarsverdict',
  },
  TEMPLARS_VERDICT: {
    id: 85256,
    name: "Templar's Verdict",
    icon: 'spell_paladin_templarsverdict',
  },
  DIVINE_STORM_DAMAGE: {
    id: 224239,
    name: 'Divine Storm',
    icon: 'ability_paladin_divinestorm',
  },
  DIVINE_PURPOSE_BUFF: {
    id: 223819,
    name: 'Divine Purpose',
    icon: 'spell_holy_mindvision',
  },
  AVENGING_WRATH: {
    id: 31884,
    name: 'Avenging Wrath',
    icon: 'spell_holy_avenginewrath',
  },
  AVENGING_WRATH_GUARANTEED_CRIT_BUFF: {
    id: 294027,
    name: 'Avenging Wrath',
    icon: 'spell_holy_avenginewrath',
  },
  BLADE_OF_WRATH_PROC: {
    id: 231843,
    name: 'Blade of Wrath',
    icon: 'ability_paladin_bladeofjusticeblue',
  },
  FIRES_OF_JUSTICE_BUFF: {
    id: 209785,
    name: 'Fires of Justice',
    icon: 'spell_holy_crusaderstrike',
  },
  RIGHTEOUS_VERDICT_BUFF: {
    id: 267611,
    name: 'Righteous Verdict',
    icon: 'spell_paladin_templarsverdict',
  },
  ZEAL_DAMAGE: {
    id: 269937,
    name: 'Zeal',
    icon: 'spell_holy_sealofblood',
  },
  SANCTIFIED_WRATH_DAMAGE: {
    id: 326731,
    name: 'Sanctified Wrath',
    icon: 'ability_paladin_sanctifiedwrath',
  },
  EMPYREAN_POWER_TALENT_BUFF: {
    id: 326733,
    name: 'Empyrean Power',
    icon: 'ability_paladin_sheathoflight',
  },
  LAY_ON_HANDS: {
    id: 633,
    name: 'Lay on Hands',
    icon: 'spell_holy_layonhands',
  },
  ART_OF_WAR: {
    id: 406086,
    name: 'Art of War',
    icon: 'ability_paladin_artofwar',
  },
  FINAL_VERDICT_RESET: {
    id: 383329,
    name: 'Final Verdict',
    icon: 'spell_paladin_hammerofwrath',
  },
  FINAL_VERDICT_FINISHER: {
    id: 383328,
    name: 'Final Verdict',
    icon: 'spell_paladin_templarsverdict',
  },
  TEMPLAR_STRIKE: {
    id: 407480,
    name: 'Templar Strike',
    icon: 'inv_sword_2h_artifactashbringer_d_01',
  },
  TEMPLAR_SLASH: {
    id: 406647,
    name: 'Templar Slash',
    icon: 'inv_sword_2h_artifactashbringerpurified_d_03',
  },
  CRUSADING_STRIKES_ENERGIZE: {
    id: 406834,
    name: 'Crusading Strikes',
    icon: 'inv_sword_2h_artifactashbringer_d_01',
  },
  CRUSADING_STRIKES: {
    id: 408385,
    name: 'Crusading Strikes',
    icon: 'spell_holy_crusaderstrike.jpg',
  },
  VANGUARDS_MOMENTUM: {
    id: 403081,
    name: "Vanguard's Momentum",
    icon: 'ability_paladin_speedoflight',
  },
  DIVINE_AUXILIARY: {
    id: 408386,
    name: 'Divine Auxiliary',
    icon: 'spell_holy_righteousfury',
  },
  RUSH_OF_LIGHT: {
    id: 407065,
    name: 'Rush of Light',
    icon: 'spell_holy_borrowedtime',
  },

  // Protection
  // GoAK has a different spell ID with Glyph of the Queen
  GUARDIAN_OF_ANCIENT_KINGS_QUEEN: {
    id: 212641,
    name: 'Guardian of Ancient Kings',
    icon: 'spell_holy_heroism',
  },
  GUARDIAN_OF_ANCIENT_KINGS: {
    id: 86659,
    name: 'Guardian of Ancient Kings',
    icon: 'spell_holy_heroism',
  },
  LIGHT_OF_THE_PROTECTOR: {
    id: 184092,
    name: 'Light of the Protector',
    icon: 'ability_paladin_lightoftheprotector',
  },
  SHIELD_OF_THE_RIGHTEOUS: {
    id: 53600,
    name: 'Shield of the Righteous',
    icon: 'ability_paladin_shieldofvengeance',
  },
  SENTINEL: {
    id: 389539,
    name: 'Sentinel',
    icon: 'spell_holy_holynova',
  },

  //artifact
  UNFLINCHING_DEFENSE: {
    id: 209220,
    name: 'Unflinching Defense',
    icon: 'spell_holy_ardentdefender',
  },
  SACRIFICE_OF_THE_JUST: {
    id: 209285,
    name: 'Sacrifice of the Just',
    icon: 'spell_holy_divineshield',
  },
  INSPIRING_VANGUARD_BUFF: {
    id: 393019,
    name: 'Inspiring Vanguard',
    icon: 'inv_helmet_74',
  },
  GRAND_CRUSADER_BUFF: {
    id: 85416,
    name: 'Grand Crusader',
    icon: 'inv_helmet_74',
  },

  // Buffs
  SHIELD_OF_THE_RIGHTEOUS_BUFF: {
    id: 132403,
    name: 'Shield of the Righteous',
    icon: 'ability_paladin_shieldofvengeance',
  },
  CONSECRATION_BUFF: {
    id: 188370,
    name: 'Consecration',
    icon: 'spell_holy_innerfire',
  },
  BLESSED_STALWART_BUFF: {
    id: 242869,
    name: 'Blessed Stalwart',
    icon: 'ability_paladin_shieldofvengeance',
  },
  FAITHS_ARMOR_BUFF: {
    id: 211903,
    name: "Faith's Armor",
    icon: 'inv_misc_armorkit_23',
  },
  BULWARK_OF_ORDER_SHIELD: {
    id: 209388,
    name: 'Bulwark of Order',
    icon: 'spell_holy_pureofheart',
  },
  IMMORTAL_OBJECT: {
    id: 207603,
    name: 'Immortal Object',
    icon: 'spell_holy_avengersshield',
  },
  SHINING_LIGHT: {
    id: 327510,
    name: 'Shining Light',
    icon: 'ability_paladin_lightoftheprotector',
  },
  REDOUBT_BUFF: {
    id: 280375,
    name: 'Redoubt',
    icon: 'ability_warrior_shieldguard',
  },
  OVERFLOWING_LIGHT_BUFF: {
    id: 461499,
    name: 'Overflowing Light',
    icon: 'spell_holy_holyguidance',
  },
  // Bonus set tiers
  PROTECTION_PALADIN_T19_2SET_BONUS_BUFF: {
    id: 211553,
    name: 'T19 2 Set Bonus',
    icon: 'trade_engineering',
  },
  PROTECTION_PALADIN_T19_4SET_BONUS_BUFF: {
    id: 211554,
    name: 'T19 4 Set Bonus',
    icon: 'trade_engineering',
  },
  PROTECTION_PALADIN_T20_2SET_BONUS_BUFF: {
    id: 242263,
    name: 'T20 2 Set Bonus',
    icon: 'ability_paladin_shieldofthetemplar',
  },
  PROTECTION_PALADIN_T20_4SET_BONUS_BUFF: {
    id: 242264,
    name: 'T20 4 Set Bonus',
    icon: 'ability_paladin_shieldofthetemplar',
  },
  //DEBUFFS
  AVENGERS_PROTECTION_DEBUFF: {
    id: 242265,
    name: "Avenger's Protection",
    icon: 'ability_paladin_shieldofthetemplar',
  },
  BLESSED_HAMMER_DEBUFF: {
    id: 204301,
    name: 'Blessed Hammer',
    icon: 'paladin_retribution',
  },
  JUDGMENT_OF_LIGHT_DEBUFF: {
    id: 196941,
    name: 'Judgement of Light',
    icon: 'spell_holy_divineprovidence',
  },
  // Shared:
  CONSECRATION_CAST: {
    id: 26573,
    name: 'Consecration',
    icon: 'spell_holy_innerfire',
  },
  CONSECRATION_DAMAGE: {
    id: 81297,
    name: 'Consecration',
    icon: 'spell_holy_innerfire',
  },
  CONSECRATED_BLADE_BUFF: {
    id: 407475,
    name: 'Consecrated Blade',
    icon: 'ability_mage_firestarter',
  },
  DIVINE_SHIELD: {
    id: 642,
    name: 'Divine Shield',
    icon: 'spell_holy_divineshield',
  },

  // T28
  ASHES_TO_ASHES: {
    id: 364371,
    name: 'Ashes To Ashes',
    icon: 'ability_paladin_artofwar',
  },
  DAWN_WILL_COME_4PC: {
    id: 363674,
    name: 'Dawn Will Come',
    icon: 'ability_priest_flashoflight',
  },
  GLORIOUS_PURPOSE_4PC: {
    id: 363675,
    name: 'Glorious Purpose',
    icon: 'spell_holy_holyprotection',
  },

  // Herald of the Sun (TWW Holy + Ret)
  DAWNLIGHT_HEAL: {
    name: 'Dawnlight',
    id: 431381,
    icon: 'inv_ability_heraldofthesunpaladin_dawnlight',
  },
  DAWNLIGHT_AOE_HEAL: {
    name: 'Dawnlight',
    id: 431382,
    icon: 'inv_ability_heraldofthesunpaladin_dawnlight',
  },
  SUNS_AVATAR_HEAL: { name: "Sun's Avatar", id: 431939, icon: 'ability_paladin_holyavenger' },
  SUNS_AVATAR_HEAL_2: { name: "Sun's Avatar", id: 463074, icon: 'ability_paladin_holyavenger' },
  SUN_SEAR_HEAL: { name: 'Sun Sear', id: 431415, icon: 'spell_priest_burningwill' },
  TRUTH_PREVAILS_HEAL: { name: 'Truth Prevails', id: 461546, icon: 'ability_paladin_artofwar' },
} satisfies Record<string, Spell>;

export default spells;
