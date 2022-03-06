/**
 * All Paladin abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

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
  LAY_ON_HANDS: {
    id: 633,
    name: 'Lay on Hands',
    icon: 'spell_holy_layonhands',
  },
  BLESSING_OF_FREEDOM: {
    id: 1044,
    name: 'Blessing of Freedom',
    icon: 'spell_holy_sealofvalor',
  },
  BLESSING_OF_PROTECTION: {
    id: 1022,
    name: 'Blessing of Protection',
    icon: 'spell_holy_sealofprotection',
  },
  HAMMER_OF_JUSTICE: {
    id: 853,
    name: 'Hammer of Justice',
    icon: 'spell_holy_sealofmight',
  },
  HAMMER_OF_WRATH: {
    id: 24275,
    name: 'Hammer of Wrath',
    icon: 'spell_paladin_hammerofwrath',
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
  TURN_EVIL: {
    id: 10326,
    name: 'Turn Evil',
    icon: 'ability_paladin_turnevil',
  },
  SENSE_UNDEAD: {
    id: 5502,
    name: 'Sense Undead',
    icon: 'spell_holy_senseundead',
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
  HOLY_SHOCK_CAST: {
    id: 20473,
    name: 'Holy Shock',
    icon: 'spell_holy_searinglight',
    manaCost: 1600,
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
  LIGHT_OF_DAWN_CAST: {
    id: 85222,
    name: 'Light of Dawn',
    icon: 'spell_paladin_lightofdawn',
  },
  HOLY_LIGHT: {
    id: 82326,
    name: 'Holy Light',
    icon: 'spell_holy_surgeoflight',
    manaCost: 1500,
  },
  LIGHT_OF_THE_MARTYR: {
    id: 183998,
    name: 'Light of the Martyr',
    icon: 'ability_paladin_lightofthemartyr',
    manaCost: 700,
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
  DIVINE_PROTECTION: {
    id: 498,
    name: 'Divine Protection',
    icon: 'spell_holy_divineprotection',
  },
  BLESSING_OF_SACRIFICE: {
    id: 6940,
    name: 'Blessing of Sacrifice',
    icon: 'spell_holy_sealofsacrifice',
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
  AVENGING_CRUSADER_TALENT: {
    id: 216331,
    name: 'Avenging Crusader',
    icon: 'ability_paladin_veneration',
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
  GLIMMER_OF_LIGHT_HEAL_TALENT: {
    id: 325983,
    name: 'Glimmer of Light',
    icon: 'ability_paladin_toweroflight',
  },
  GLIMMER_OF_LIGHT_BUFF: {
    id: 287280,
    name: 'Glimmer of Light',
    icon: 'ability_paladin_toweroflight',
  },
  GLIMMER_OF_LIGHT_DAMAGE_TALENT: {
    id: 325984,
    name: 'Glimmer of Light',
    icon: 'ability_paladin_toweroflight',
  },

  // Retribution Paladin:
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
  BLADE_OF_JUSTICE: {
    id: 184575,
    name: 'Blade of Justice',
    icon: 'ability_paladin_bladeofjustice',
  },
  DIVINE_STORM_DAMAGE: {
    id: 224239,
    name: 'Divine Storm',
    icon: 'ability_paladin_divinestorm',
  },
  DIVINE_STORM: {
    id: 53385,
    name: 'Divine Storm',
    icon: 'ability_paladin_divinestorm',
  },
  SHIELD_OF_VENGEANCE: {
    id: 184662,
    name: 'Shield of Vengeance',
    icon: 'ability_paladin_shieldofthetemplar',
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
  ART_OF_WAR: {
    id: 267344,
    name: 'Art of War',
    icon: 'ability_paladin_artofwar',
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
  EXECUTION_SENTENCE_DEBUFF: {
    id: 343257,
    name: 'Execution Sentence',
    icon: 'spell_paladin_executionsentence',
  },
  WAKE_OF_ASHES: {
    id: 255937,
    name: 'Wake of Ashes',
    icon: 'inv_sword_2h_artifactashbringerfire_d_03',
  },
  HAND_OF_HINDRANCE: {
    id: 183218,
    name: 'Hand of Hindrance',
    icon: 'ability_paladin_handofhindrance',
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

  // Protection
  ARDENT_DEFENDER: {
    id: 31850,
    name: 'Ardent Defender',
    icon: 'spell_holy_ardentdefender',
  },
  AVENGERS_SHIELD: {
    id: 31935,
    name: "Avenger's Shield",
    icon: 'spell_holy_avengersshield',
  },
  GUARDIAN_OF_ANCIENT_KINGS: {
    id: 86659,
    name: 'Guardian of Ancient Kings',
    icon: 'spell_holy_heroism',
  },
  // GoAK has a different spell ID with Glyph of the Queen
  GUARDIAN_OF_ANCIENT_KINGS_QUEEN: {
    id: 212641,
    name: 'Guardian of Ancient Kings',
    icon: 'spell_holy_heroism',
  },
  HAMMER_OF_THE_RIGHTEOUS: {
    id: 53595,
    name: 'Hammer of the Righteous',
    icon: 'ability_paladin_hammeroftherighteous',
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
  CLEANSE_TOXINS: {
    id: 213644,
    name: 'Cleanse Toxins',
    icon: 'spell_holy_renew',
  },
  REBUKE: {
    id: 96231,
    name: 'Rebuke',
    icon: 'spell_holy_rebuke',
  },
  GRAND_CRUSADER: {
    id: 85043,
    name: 'Grand Crusader',
    icon: 'inv_helmet_74',
  },
  //artifact
  EYE_OF_TYR: {
    id: 209202,
    name: 'Eye of Tyr',
    icon: 'inv_shield_1h_artifactnorgannon_d_01',
  },
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
  // the shining light buff does not have a proper tooltip. this one does. used in display
  SHINING_LIGHT_DESC: {
    id: 321136,
    name: 'Shining Light',
    icon: 'ability_paladin_toweroflight',
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
} as const;

export default spells;
