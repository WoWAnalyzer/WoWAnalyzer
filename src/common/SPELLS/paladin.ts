/**
 * All Paladin abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';
import talents from 'common/TALENTS/paladin';

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
    manaCost: 60000,
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
    manaCost: 17500,
  },
  DIVINE_PROTECTION_RET: {
    id: 403876,
    name: 'Divine Protection',
    icon: 'spell_holy_divineprotection',
    manaCost: 17500,
  },
  HOLY_LIGHT: {
    id: 82326,
    name: 'Holy Light',
    icon: 'spell_holy_surgeoflight',
    manaCost: 175000,
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
    manaCost: 15000,
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
  INFUSION_OF_LIGHT: {
    id: 54149,
    name: 'Infusion of Light',
    icon: 'ability_paladin_infusionoflight',
  },
  CLEANSE: {
    id: 4987,
    name: 'Cleanse',
    icon: 'spell_holy_purify',
    manaCost: 32500,
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
  BLESSING_OF_SUMMER_TALENT: {
    id: 388007,
    name: 'Blessing of Summer',
    icon: 'ability_ardenweald_paladin_summer',
  },
  BLESSING_OF_SUMMER_HEAL: {
    id: 448227,
    name: 'Blessing of Summer',
    icon: 'ability_ardenweald_paladin_summer',
  },
  BLESSING_OF_SUMMER_DAMAGE: {
    id: 388009,
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
  SACRED_WEAPON_BUFF: {
    id: 432502,
    name: 'Sacred Weapon',
    icon: 'inv_ability_lightsmithpaladin_sacredweapon',
  },
  SACRED_WEAPON_DAMAGE: {
    id: 432616,
    name: 'Sacred Weapon',
    icon: 'inv_ability_lightsmithpaladin_sacredweapon',
  },
  SACRED_WEAPON_HEAL: {
    id: 441590,
    name: 'Sacred Weapon',
    icon: 'inv_ability_lightsmithpaladin_sacredweapon',
  },
  HOLY_BULWARK_BUFF: {
    id: 432496,
    name: 'Holy Bulwark',
    icon: 'inv_ability_lightsmithpaladin_holybulwark',
  },
  HOLY_BULWARK_ABSORB: {
    id: 432607,
    name: 'Holy Bulwark',
    icon: 'spell_holy_greaterblessingofsanctuary',
  },
  BLESSING_OF_THE_FORGE_DAMAGE: {
    id: 447258,
    name: 'Blessing of the Forge',
    icon: 'inv_ability_lightsmithpaladin_sacredweapon',
  },
  DIVINE_GUIDANCE_BUFF: {
    id: 460822,
    name: 'Divine Guidance',
    icon: 'spell_holy_lightsgrace',
  },
  DIVINE_GUIDANCE_HEAL: {
    id: 433807,
    name: 'Divine Guidance',
    icon: 'spell_holy_lightsgrace',
  },
  DIVINE_GUIDANCE_DAMAGE: {
    id: 433808,
    name: 'Divine Guidance',
    icon: 'spell_holy_lightsgrace',
  },
  BLESSED_ASSURANCE_BUFF: {
    id: 433019,
    name: 'Blessed Assurance',
    icon: 'spell_holy_blessedlife',
  },
  EMPYREAN_LEGACY_BUFF: {
    id: 387178,
    name: 'Empyrean Legacy',
    icon: 'item_holyspark',
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
  BEACON_OF_THE_SAVIOR_BUFF: {
    id: 1244893,
    name: 'Beacon of the Savior',
    icon: 'inv12_apextalent_paladin_beaconofthesavior',
  },
  BEACON_OF_THE_SAVIOR_ABSORB: {
    id: 1245369,
    name: 'Beacon of the Savior',
    icon: 'inv12_apextalent_paladin_beaconofthesavior',
  },

  // Retribution Paladin:
  SHIELD_OF_VENGEANCE_ABSORB: {
    id: 184662,
    name: 'Shield of Vengeance',
    icon: 'Ability_paladin_shieldofthetemplar',
  },
  AVENGING_WRATH_BUFF: {
    id: 454351,
    name: 'Avenging Wrath',
    icon: 'spell_holy_avenginewrath',
  },
  INSTRUMENT_OF_RETRIBUTION: {
    id: 404752,
    name: 'Instrument of Retribution',
    icon: 'spell_holy_crusade',
  },
  EXECUTION_SENTENCE_FALL_DAMAGE: {
    id: 387113,
    name: 'Execution Sentence',
    icon: 'spell_paladin_executionsentence',
  },
  EXECUTION_SENTENCE_APPLY_DAMAGE: {
    id: 1260251,
    name: 'Execution Sentence',
    icon: 'spell_paladin_executionsentence',
  },
  CRUSADE: {
    id: 454373,
    name: 'Crusade',
    icon: 'ability_paladin_sanctifiedwrath',
  },
  DIVINE_HAMMER_EXTEND: {
    id: 198137,
    name: 'Divine Hammer',
    icon: 'classicon_paladin',
  },
  DIVINE_HAMMER_CAST: {
    id: 198034,
    name: 'Divine Hammer',
    icon: 'classicon_paladin',
  },
  JUDGMENT_DEBUFF: {
    id: 197277,
    name: 'Judgment',
    icon: 'spell_holy_righteousfury',
  },
  EXPURGATION_DEBUFF: {
    id: 383346,
    name: 'Expurgation',
    icon: 'ability_paladin_bladeofjustice',
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
  DIVINE_PURPOSE_BUFF_RET: {
    id: 408458,
    name: 'Divine Purpose',
    icon: 'spell_holy_mindvision',
  },
  AVENGING_CRUSADER: {
    id: 216331,
    name: 'Avenging Crusader',
    icon: 'ability_paladin_veneration',
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
  EMPYREAN_POWER_TALENT_BUFF: {
    id: 326733,
    name: 'Empyrean Power',
    icon: 'ability_paladin_sheathoflight',
  },
  LAY_ON_HANDS_EMPYREAL_WARD: {
    id: 471195,
    name: 'Lay on Hands',
    icon: 'spell_holy_layonhands.jpg',
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
    icon: 'inv_sword_08',
  },
  CRUSADING_STRIKES: {
    id: 408385,
    name: 'Crusading Strikes',
    icon: 'inv_sword_08',
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
  //DEBUFFS
  BLESSED_HAMMER_DEBUFF: {
    id: 204301,
    name: 'Blessed Hammer',
    icon: 'paladin_retribution',
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
  DAWNLIGHT_DAMAGE: {
    name: 'Dawnlight',
    id: 431380,
    icon: 'inv_ability_heraldofthesunpaladin_dawnlight',
  },
  SUNS_AVATAR_HEAL: {
    name: "Sun's Avatar",
    id: 431939,
    icon: 'ability_paladin_holyavenger',
  },
  SUNS_AVATAR_HEAL_SELF_APPLIED: {
    name: "Sun's Avatar",
    id: 463074,
    icon: 'ability_paladin_holyavenger',
  },
  SUNS_AVATAR_DAMAGE: {
    name: "Sun's Avatar",
    id: 431911,
    icon: 'ability_paladin_holyavenger',
  },
  SUNS_AVATAR_DAMAGE_SELF_APPLIED: {
    name: "Sun's Avatar",
    id: 463075,
    icon: 'ability_paladin_holyavenger',
  },
  SUN_SEAR_HEAL: {
    name: 'Sun Sear',
    id: 431415,
    icon: 'spell_priest_burningwill',
  },
  TRUTH_PREVAILS_HEAL: {
    name: 'Truth Prevails',
    id: 461546,
    icon: 'ability_paladin_artofwar',
  },
  SECOND_SUNRISE_HOLY_POWER: {
    id: 456766,
    name: 'Second Sunrise',
    icon: 'ability_priest_halo',
  },
  HAMMER_OF_LIGHT: {
    id: 427453,
    name: 'Hammer of Light',
    icon: 'inv_mace_1h_gryphonrider_d_02_silver.jpg',
    holyPowerCost: 5,
  },
  LIGHTS_DELIVERANCE_FREE_CAST_BUFF: {
    ...talents.LIGHTS_DELIVERANCE_TALENT,
    id: 433732,
  },
  EMPYREAN_HAMMER: {
    id: 431398,
    name: 'Empyrean Hammer',
    icon: 'ability_paladin_judgementofthepure.jpg',
  },
  SACROSANCT_CRUSADE_BUFF: {
    id: 461867,
    name: 'Sacrosanct Crusade',
    icon: 'inv_plate_raidpaladinprimalist_d_01_cape.jpg',
  },
  INTERCESSION: {
    id: 391054,
    name: 'Intercession',
    icon: 'ability_paladin_intercession.jpg',
  },
  UNDISPUTED_RULING_BUFF: {
    ...talents.UNDISPUTED_RULING_TALENT,
    id: 432629,
  },
  SHAKE_THE_HEAVENS_BUFF: {
    ...talents.SHAKE_THE_HEAVENS_TALENT,
    id: 431536,
  },
  HAMMER_AND_ANVIL_HEAL: {
    id: 433722,
    name: 'Hammer and Anvil',
    icon: 'inv_10_blacksmithing_consumable_repairhammer_color1',
  },
  VENERATION_HEAL: {
    id: 414407,
    name: 'Veneration',
    icon: 'ability_crown_of_the_heavens_icon',
  },
  VENERATION_HEAL_CRIT: {
    id: 414408,
    name: 'Veneration',
    icon: 'ability_crown_of_the_heavens_icon',
  },
  INSURANCE_PROC_PALADIN: {
    id: 1215535,
    name: 'Insurance!',
    icon: 'inv_10_inscription2_scroll2_color5',
  },
  INSURANCE_HOT_PALADIN: {
    id: 1215534,
    name: 'Insurance!',
    icon: 'inv_10_inscription2_scroll2_color5',
  },
  RADIANT_AURA_HEAL: {
    id: 447250,
    name: 'Radiant Aura',
    icon: 'inv_staff_2h_artifacttome_d_06',
  },
  LIGHTBEARER_HEAL: {
    id: 469421,
    name: 'Lightbearer',
    icon: 'spell_paladin_clarityofpurpose',
  },
  SACRED_WORD_HEAL: {
    id: 447246,
    name: 'Sacred Word',
    icon: 'inv_mace_1h_artifactnorgannon_d_06',
  },
  HOLY_RITUAL_HEAL: {
    id: 199423,
    name: 'Holy Ritual',
    icon: 'spell_holy_surgeoflight',
  },
  UNENDING_LIGHT_BUFF: {
    id: 394709,
    name: 'Unending Light',
    icon: 'spell_holy_holybolt',
  },
  LIGHTFORGED_BLESSING: {
    id: 407467,
    name: 'Lightforged Blessing',
    icon: 'spell_holy_healingaura',
  },
  BLESSING_OF_ANSHE_BUFF: {
    id: 445204,
    name: "Blessing of An'she",
    icon: 'inv_ability_holyfire_orb',
  },
  SOLAR_GRACE_BUFF: {
    id: 439841,
    name: 'Solar Grace',
    icon: 'ability_malkorok_blightofyshaarj_yellow',
  },
} satisfies Record<string, Spell>;

export default spells;
