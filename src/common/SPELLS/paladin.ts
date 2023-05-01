/**
 * All Paladin abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from './Spell';

const spells = spellIndexableList({
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
    manaCost: 300,
  },
  JUDGMENT_CAST_HOLY: {
    id: 275773,
    name: 'Judgment',
    icon: 'spell_holy_righteousfury',
    manaCost: 300,
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
  LIGHTS_HAMMER_HEAL: {
    id: 119952,
    name: "Light's Hammer",
    icon: 'spell_paladin_lightshammer',
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
  GLIMMER_OF_LIGHT_BUFF: {
    id: 287280,
    name: 'Glimmer of Light',
    icon: 'ability_paladin_toweroflight',
  },
  GLIMMER_OF_LIGHT_HEAL_TALENT: {
    id: 325983,
    name: 'Glimmer of Light',
    icon: 'ability_paladin_toweroflight',
  },
  GLIMMER_OF_LIGHT_DAMAGE_TALENT: {
    id: 325984,
    name: 'Glimmer of Light',
    icon: 'ability_paladin_toweroflight',
  },
  GOLDEN_PATH_HEAL_TALENT: {
    id: 377129,
    name: 'Golden Path',
    icon: 'ability_priest_cascade',
  },
  UNTEMPERED_DEDICATION_BUFF: {
    id: 387815,
    name: 'Untempered Dedication',
    icon: 'achievement_admiral_of_the_light',
  },
  MARAADS_DYING_BREATH_BUFF: {
    id: 388019,
    name: "Maraad's Dying Breath",
    icon: 'paladin_icon_speedoflight',
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
  WAKE_OF_ASHES: {
    id: 255937,
    name: 'Wake of Ashes',
    icon: 'inv_sword_2h_artifactashbringerfire_d_03',
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
    id: 267344,
    name: 'Art of War',
    icon: 'ability_paladin_artofwar',
  },
  FINAL_VERDICT_RESET: {
    // TODO: Make this actually correct, I could not find any logs with the ability
    id: 337228,
    name: 'Final Verdict',
    icon: 'spell_paladin_hammerofwrath',
  },
  FINAL_VERDICT_FINISHER: {
    // TODO: Make this actually correct, I could not find any logs with the ability
    id: 336872,
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

  // Protection
  // GoAK has a different spell ID with Glyph of the Queen
  GUARDIAN_OF_ANCIENT_KINGS_QUEEN: {
    id: 212641,
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
});

export default spells;
