/**
 * All Priest abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Discipline Priest:
  PENANCE: {
    id: 47666,
    name: 'Penance',
    icon: 'spell_holy_penance',
    manaCost: 30800,
  },
  PENANCE_HEAL: { // Penance on a friendly player
    id: 47750,
    name: 'Penance',
    icon: 'spell_holy_penance',
    manaCost: 30800,
  },
  POWER_WORD_SHIELD: {
    id: 17,
    name: 'Power Word: Shield',
    icon: 'spell_holy_powerwordshield',
    manaCost: 25300,
    atonementDuration: 15,
  },
  SMITE: {
    id: 585,
    name: 'Smite',
    icon: 'spell_holy_holysmite',
    manaCost: 5500,
  },
  POWER_WORD_RADIANCE: {
    id: 194509,
    name: 'Power Word: Radiance',
    icon: 'spell_priest_power-word',
    manaCost: 71500,
    atonementDuration: 9,
  },
  SHADOW_MEND: {
    id: 186263,
    name: 'Shadow Mend',
    icon: 'spell_shadow_shadowmend',
    atonementDuration: 15,
  },
  RAPTURE: {
    id: 47536,
    name: 'Rapture',
    icon: 'spell_holy_rapture',
  },
  PAIN_SUPPRESSION: {
    id: 33206,
    name: 'Pain Suppression',
    icon: 'spell_holy_painsupression',
    manaCost: 17600,
  },
  MASS_DISPEL: {
    id: 32375,
    name: 'Mass Dispel',
    icon: 'spell_arcane_massdispel',
  },
  DISPEL_MAGIC: {
    id: 528,
    name: 'Dispel Magic',
    icon: 'spell_nature_nullifydisease',
  },
  LEAP_OF_FAITH: {
    id: 73325,
    name: 'Leap of Faith',
    icon: 'priest_spell_leapoffaith_a',
  },
  LEVITATE: {
    id: 1706,
    name: 'Levitate',
    icon: 'spell_holy_layonhands',
  },
  LIGHTS_WRATH: {
    id: 207946,
    name: 'Light\'s Wrath',
    icon: 'inv_staff_2h_artifacttome_d_01',
  },
  MIND_CONTROL: {
    id: 605,
    name: 'Mind Control',
    icon: 'spell_shadow_shadowworddominate',
  },
  POWER_WORD_BARRIER_CAST: {
    id: 62618,
    name: 'Power Word: Barrier',
    icon: 'spell_holy_powerwordbarrier',
  },
  POWER_WORD_BARRIER_BUFF: {
    id: 81782,
    name: 'Power Word: Barrier',
    icon: 'spell_holy_powerwordbarrier',
  },
  PURIFY: {
    id: 527,
    name: 'Purify',
    icon: 'spell_holy_dispelmagic',
  },
  SHACKLE_UNDEAD: {
    id: 9484,
    name: 'Shackle Undead',
    icon: 'spell_nature_slow',
  },
  SHADOWFIEND: {
    id: 34433,
    name: 'Shadowfiend',
    icon: 'spell_shadow_shadowfiend',
  },
  LIGHTSPAWN: {
    id: 254224,
    name: 'Shadowfiend',
    icon: 'spell_shadow_shadowfiend',
  },
  SHADOWFIEND_WITH_GLYPH_OF_THE_SHA: {
    id: 132603,
    name: 'Shadowfiend',
    icon: 'spell_shadow_shadowfiend',
  },
  SHADOW_WORD_PAIN: {
    id: 589,
    name: 'Shadow Word: Pain',
    icon: 'spell_shadow_shadowwordpain',
  },
  FADE: {
    id: 586,
    name: 'Fade',
    icon: 'spell_magic_lesserinvisibilty',
  },
  PSYCHIC_SCREAM: {
    id: 8122,
    name: 'Psychic Scream',
    icon: 'spell_shadow_psychicscream',
  },
  ATONEMENT_HEAL_NON_CRIT: {
    id: 81751,
    name: 'Atonement',
    icon: 'spell_holy_circleofrenewal',
  },
  ATONEMENT_HEAL_CRIT: {
    id: 94472,
    name: 'Atonement',
    icon: 'spell_holy_circleofrenewal',
  },
  ATONEMENT_BUFF: {
    id: 194384,
    name: 'Atonement',
    icon: 'ability_priest_atonement',
  },
  HALO_HEAL: {
    id: 120692,
    name: 'Halo',
    icon: 'ability_priest_halo',
  },
  DISC_PRIEST_T19_2SET_BONUS_BUFF: {
    id: 211556,
    name: 'T19 2 Set Bonus',
    icon: 'spell_holy_powerwordshield',
  },
  DISC_PRIEST_T19_4SET_BONUS_BUFF: {
    id: 211563,
    name: 'T19 4 Set Bonus',
    icon: 'spell_holy_powerwordshield',
  },
  DISC_PRIEST_T20_2SET_BONUS_PASSIVE: {
    id: 242268,
    name: 'T20 2 Set Bonus',
    icon: 'spell_holy_penance',
  },
  DISC_PRIEST_T20_4SET_BONUS_PASSIVE: {
    id: 242269,
    name: 'T20 4 Set Bonus',
    icon: 'spell_holy_penance',
  },
  DISC_PRIEST_T20_4SET_BONUS_BUFF: {
    id: 246519,
    name: 'T20 4 Set Bonus',
    icon: 'spell_holy_penance',
  },
  DISC_PRIEST_T21_2SET_BONUS_PASSIVE: {
    id: 251843,
    name: 'T21 2 Set Bonus',
    icon: 'ability_priest_ascension',
  },
  DISC_PRIEST_T21_4SET_BONUS_PASSIVE: {
    id: 251844,
    name: 'T21 4 Set Bonus',
    icon: 'spell_holy_searinglightpriest',
  },
  DISC_PRIEST_T21_4SET_BONUS_BUFF: {
    id: 252848,
    name: 'T21 4 Set Buff',
    icon: 'spell_holy_searinglightpriest',
  },
  KAM_XIRAFF_BUFF: {
    id: 233997,
    name: 'Kam Xi\'raff',
    icon: 'ability_priest_savinggrace',
  },
  TWIST_OF_FATE_BUFF: {
    id: 123254,
    name: 'Twist of Fate',
    icon: 'spell_shadow_mindtwisting',
  },
  PURGE_THE_WICKED_BUFF: {
    id: 204213,
    name: 'Purge the Wicked',
    icon: 'ability_mage_firestarter',
  },
  ESTEL_DEJAHNAS_INSPIRATION_BUFF: {
    id: 214637,
    name: 'Dejahna\'s Inspiration',
    icon: 'spell_holy_heal',
  },

  // Talents:
  // lv90
  PURGE_THE_WICKED_TALENT: {
    id: 204197,
    name: 'Purge the Wicked',
    icon: 'ability_mage_firestarter',
    manaCost: 22000,
  },
  HALO_TALENT: {
    id: 120517,
    name: 'Halo',
    icon: 'ability_priest_halo',
    manaCost: 39600,
  },

  // Holy Priest Spells
  GREATER_HEAL: {
    id: 2060,
    name: 'Heal',
    icon: 'spell_holy_greaterheal',
    manaCost: 18700,
  },

  FLASH_HEAL: {
    id: 2061,
    name: 'Flash Heal',
    icon: 'spell_holy_flashheal',
    manaCost: 30800,
  },

  PRAYER_OF_MENDING_CAST: {
    id: 33076,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
    manaCost: 22000,
  },

  PRAYER_OF_MENDING_HEAL: {
    id: 33110,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
    manaCost: 22000,
  },

  PRAYER_OF_MENDING_BUFF: {
    id: 41635,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
    manaCost: 22000,
  },

  PRAYER_OF_HEALING: {
    id: 596,
    name: 'Prayer of Healing',
    icon: 'spell_holy_prayerofhealing02',
    manaCost: 49500,
  },

  ECHO_OF_LIGHT: {
    id: 77489,
    name: 'Echo of Light',
    icon: 'spell_holy_aspiration',
  },

  RENEW: {
    id: 139,
    name: 'Renew',
    icon: 'spell_holy_renew',
    manaCost: 22000,
  },

  HOLY_WORD_SERENITY: {
    id: 2050,
    name: 'Holy Word: Serenity',
    icon: 'spell_holy_persuitofjustice',
    manaCost: 44000,
  },

  HOLY_WORD_SANCTIFY: {
    id: 34861,
    name: 'Holy Word: Sanctify',
    icon: 'spell_holy_divineprovidence',
    manaCost: 55000,
  },

  DESPERATE_PRAYER: {
    id: 19236,
    name: 'Desperate Prayer',
    icon: 'spell_holy_testoffaith',
  },

  GUARDIAN_SPIRIT: {
    id: 47788,
    name: 'Guardian Spirit',
    icon: 'spell_holy_guardianspirit',
    manaCost: 9900,
  },

  DIVINE_HYMN_CAST: {
    id: 64843,
    name: 'Divine Hymn',
    icon: 'spell_holy_divinehymn',
    manaCost: 48400,
  },

  DIVINE_HYMN_HEAL: {
    id: 64844,
    name: 'Divine Hymn',
    icon: 'spell_holy_divinehymn',
  },

  SERENDIPITY: {
    id: 63733,
    name: 'Serendipity',
    icon: 'spell_holy_serendipity',
  },

  // Trait related spells
  LIGHT_OF_TUURE_TRAIT: {
    id: 208065,
    name: 'Light of T\'uure',
    icon: 'inv_staff_2h_artifactheartofkure_d_01',
    duration: 10,
  },

  CARESS_OF_THE_NAARU_TRAIT: {
    id: 238064,
    name: 'Caress of the Naaru',
    icon: 'inv_staff_2h_artifactheartofkure_d_01',
  },

  COSMIC_RIPPLE_TRAIT: {
    id: 243241,
    name: 'Cosmic Ripple',
    icon: 'spell_holy_circleofrenewal',
  },

  HOLY_MENDING_TRAIT: {
    id: 196781,
    name: 'Holy Mending',
    icon: 'spell_holy_divineprovidence',
  },

  RENEW_THE_FAITH_TRAIT: {
    id: 196492,
    name: 'Renew the Faith',
    icon: 'spell_holy_divinehymn',
  },

  SAY_YOUR_PRAYERS_TRAIT: {
    id: 196358,
    name: 'Say Your Prayers',
    icon: 'spell_holy_prayerofmendingtga',
    coeff: 0.06,
  },

  HALLOWED_GROUND_TRAIT: {
    id: 196429,
    name: 'Hallowed Ground',
    icon: 'spell_holy_divineprovidence',
    valuePerTrait: 3333,
  },

  LENIENCE: {
    id: 238063,
    name: 'Lenience',
    icon: 'ability_priest_atonement',
  },

  // Buffs
  BLESSING_OF_TUURE_BUFF: {
    id: 196644,
    name: 'Blessing of T\'uure',
    icon: 'inv_pet_naaru',
  },

  DIVINITY_BUFF: {
    id: 197030,
    name: 'Divinity',
    icon: 'ability_priest_ascendance',
  },

  POWER_OF_THE_NAARU_BUFF: {
    id: 196490,
    name: 'Power of the Naaru',
    icon: 'spell_holy_prayerofhealing02',
  },

  // Holy Legendaries
  XANSHI_CLOAK_BUFF: {
    id: 211336,
    name: 'Xan\'shi, Shroud of Archbishop Benedictus',
    icon: 'inv_enchant_essencemagiclarge',
  },

  // Holy Tier Sets
  HOLY_PRIEST_T20_2SET_BONUS_BUFF: {
    id: 242270,
    name: 'Holy Priest T20 2P Bonus',
    icon: 'spell_holy_guardianspirit',
    value: 1000,
  },

  HOLY_PRIEST_T20_4SET_BONUS_BUFF: {
    id: 242271,
    name: 'Holy Priest T20 4P Bonus',
    icon: 'spell_holy_guardianspirit',
  },

  HOLY_PRIEST_T21_2SET_BONUS_BUFF: {
    id: 251831,
    name: 'Holy Priest T21 2P Bonus',
    icon: 'ability_priest_ascension',
  },

  HOLY_PRIEST_ANSWERED_PRAYERS: {
    id: 253437,
    name: 'Answered Prayers',
    icon: 'spell_holy_divinespirit',
  },

  HOLY_PRIEST_T21_4SET_BONUS_BUFF: {
    id: 251842,
    name: 'Holy Priest T21 4P Bonus',
    icon: 'ability_priest_ascension',
  },

  HOLY_PRIEST_EVERLASTING_HOPE: {
    id: 253443,
    name: 'Everlasting Hope',
    icon: 'ability_priest_rayofhope',
  },

  // Shadow Spells

  VOID_TORRENT: {
    id: 205065,
    name: 'Void Torrent',
    icon: 'inv_knife_1h_artifactcthun_d_01',
  },

  MIND_BLAST: {
    id: 8092,
    name: 'Mind Blast',
    icon: 'spell_shadow_unholyfrenzy',
  },

  MIND_FLAY: {
    id: 15407,
    name: 'Mind Flay',
    icon: 'spell_shadow_siphonmana',
  },

  VAMPIRIC_TOUCH: {
    id: 34914,
    name: 'Vampiric Touch',
    icon: 'spell_holy_stoicism',
  },

  SHADOW_WORD_DEATH: {
    id: 32379,
    name: 'Shadow Word: Death',
    icon: 'spell_shadow_demonicfortitude',
  },

  VOID_ERUPTION: {
    id: 228260,
    name: 'Void Eruption',
    icon: 'spell_priest_void-blast',
  },

  // From shadow word pain/vampiric touch:
  VOID_ERUPTION_DAMAGE_1: {
    id: 228360,
    name: 'Void Eruption',
    icon: 'spell_priest_void-blast',
  },

  // From shadow word pain/vampiric touch:
  VOID_ERUPTION_DAMAGE_2: {
    id: 228361,
    name: 'Void Eruption',
    icon: 'spell_priest_void-blast',
  },

  VOID_BOLT: {
    id: 205448,
    name: 'Void Bolt',
    icon: 'ability_ironmaidens_convulsiveshadows',
  },

  DISPERSION: {
    id: 47585,
    name: 'Dispersion',
    icon: 'spell_shadow_dispersion',
  },

  VAMPIRIC_EMBRACE: {
    id: 15286,
    name: 'Vampiric Embrace',
    icon: 'spell_shadow_unsummonbuilding',
  },

  VAMPIRIC_EMBRACE_HEAL: {
    id: 15290,
    name: 'Vampiric Embrace',
    icon: 'spell_shadow_unsummonbuilding',
  },

  SILENCE: {
    id: 15487,
    name: 'Silence',
    icon: 'ability_priest_silence',
  },

  PURIFY_DISEASE: {
    id: 213634,
    name: 'Purify Disease',
    icon: 'spell_holy_nullifydisease',
  },

  SHADOWFORM: {
    id: 232698,
    name: 'Shadowform',
    icon: 'spell_shadow_shadowform',
  },

  MIND_VISION: {
    id: 2096,
    name: 'Mind Vision',
    icon: 'spell_holy_mindvision',
  },

  MIND_SEAR: {
    id: 234702,
    name: 'Mind Sear',
    icon: 'spell_shadow_mindshear',
  },

  SHADOWY_APPARITION: {
    id: 147193,
    name: 'Shadowy Apparition',
    icon: 'ability_priest_shadowyapparition',
  },

  // Shadow Buffs

  VOIDFORM: {
    id: 228264,
    name: 'Voidform',
    icon: 'spell_priest_voidform',
  },

  VOIDFORM_BUFF: {
    id: 194249,
    name: 'Voidform',
    icon: 'spell_priest_voidform',
  },

  LINGERING_INSANITY: {
    id: 197937,
    name: 'Lingering Insanity',
    icon: 'spell_shadow_twistedfaith',
  },

  // Shadow items:

  SHADOW_PRIEST_T20_4SET_BONUS_PASSIVE: {
    id: 242273,
    name: 'T20 4 Set Bonus',
    icon: 'spell_shadow_shadowwordpain',
  },

  ANUNDS_SEARED_SHACKLES_BUFF: {
    id: 215210,
    name: "Anund's Last Breath",
    icon: 'ability_ironmaidens_convulsiveshadows',
  },

  HEART_OF_THE_VOID_HEAL: {
    id: 248219,
    name: "Heart of the Void",
    icon: 'spell_priest_void-blast',
  },

  THE_TWINS_PAINFUL_TOUCH: {
    id: 207724,
    name: "The Twins' Painful Touch",
    icon: "spell_shadow_mindflay",
  },

  SHADOW_PRIEST_T21_2SET_BONUS_PASSIVE: {
    id: 251845,
    name: 'Shadow Priest T21 2P Bonus',
    icon: 'ability_priest_ascension',
  },

  SHADOW_PRIEST_T21_4SET_BONUS_PASSIVE: {
    id: 251846,
    name: 'Shadow Priest T21 4P Bonus',
    icon: 'ability_priest_ascension',
  },

  // Shadow traits

  FROM_THE_SHADOWS_TRAIT: {
    id: 193642,
    name: 'From the Shadows',
    icon: 'spell_shadow_summonvoidwalker',
  },
  LASH_OF_INSANITY_TRAIT: {
    id: 238137,
    name: 'Lash of Insanity',
    icon: 'achievement_boss_yoggsaron_01',
  },
  CALL_TO_THE_VOID_MIND_FLAY: {
    id: 237388,
    name: 'Mind Flay',
    icon: 'spell_shadow_mindshear',
  },
  FIENDING_DARK_TRAIT: {
    id: 238065,
    name: 'Fiending Dark',
    icon: 'spell_shadow_shadowfiend',
  },
  MIND_QUICKENING: {
    id: 240673,
    name: 'Mind Quickening',
    icon: 'inv_enchant_voidsphere',
  },
};
