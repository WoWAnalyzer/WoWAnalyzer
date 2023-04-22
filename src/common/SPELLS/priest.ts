/**
 * All Priest abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from './Spell';

const spells = spellIndexableList({
  // Shared
  HOLY_NOVA_HEAL: {
    id: 281265,
    name: 'Holy Nova',
    icon: 'spell_holy_holynova',
    manaCost: 800,
  },
  POWER_WORD_FORTITUDE: {
    id: 21562,
    name: 'Power Word: Fortitude',
    icon: 'spell_holy_wordfortitude',
    manaCost: 2000,
  },
  DESPERATE_PRAYER: {
    id: 19236,
    name: 'Desperate Prayer',
    icon: 'spell_holy_testoffaith',
  },
  MIND_SOOTHE: {
    id: 453,
    name: 'Mind Soothe',
    icon: 'spell_holy_mindsooth',
    manaCost: 500,
  },
  MINDGAMES_HEAL: {
    id: 375904,
    name: 'Mindgames',
    icon: 'ability_revendreth_priest',
  },
  MINDGAMES_ABSORB: {
    id: 375902,
    name: 'Mindgames',
    icon: 'ability_revendreth_priest',
  },
  MINDGAMES_HEAL_REVERSAL: {
    id: 375903,
    name: 'Mindgames',
    icon: 'ability_revendreth_priest',
  },
  CRYSTALLINE_REFLECTION_TALENT_HEAL: {
    id: 373462,
    name: 'Crystalline Reflection',
    icon: 'ability_priest_reflectiveshield',
  },
  BORROWED_TIME_BUFF: {
    id: 390692,
    name: 'Borrowed Time',
    icon: 'spell_holy_borrowedtime',
  },
  // Discipline Priest:
  GRACE: {
    id: 271534,
    name: 'Mastery: Grace',
    icon: 'spell_holy_hopeandgrace',
  },

  PENANCE: {
    id: 47666,
    name: 'Penance',
    icon: 'spell_holy_penance',
    manaCost: 4000,
  },
  PENANCE_HEAL: {
    // Penance on a friendly player
    id: 47750,
    name: 'Penance',
    icon: 'spell_holy_penance',
    manaCost: 4000,
  },
  DARK_REPRIMAND_HEAL: {
    id: 400187,
    name: 'Dark Reprimand',
    icon: 'inv_artifact_powerofthedarkside',
    manaCost: 4000,
  },
  DARK_REPRIMAND_DAMAGE: {
    id: 373130,
    name: 'Dark Reprimand',
    icon: 'inv_artifact_powerofthedarkside',
    manaCost: 4000,
  },
  DARK_REPRIMAND_CAST: {
    id: 400169,
    name: 'Dark Reprimand',
    icon: 'inv_artifact_powerofthedarkside',
    manaCost: 4000,
  },
  PENANCE_CAST: {
    id: 47540,
    name: 'Penance',
    icon: 'spell_holy_penance',
    manaCost: 4000,
  },
  HARSH_DISCIPLINE_BUFF: {
    id: 373183,
    name: 'Harsh Discipline',
    icon: 'ability_paladin_handoflight',
  },
  SINS_OF_THE_MANY: {
    id: 280391,
    name: 'Sins of the Many',
    icon: 'spell_holy_holyguidance',
  },
  POWER_WORD_SHIELD: {
    id: 17,
    name: 'Power Word: Shield',
    icon: 'spell_holy_powerwordshield',
    manaCost: 7750,
  },
  SHIELD_OF_ABSOLUTION_BUFF: {
    id: 394624,
    name: 'Shield Of Absolution',
    icon: 'ability_priest_clarityofwill',
  },
  RADIANT_PROVIDENCE_BUFF: {
    id: 410638,
    name: 'Radiant Providence',
    icon: 'spell_priest_power-word',
  },
  SMITE: {
    id: 585,
    name: 'Smite',
    icon: 'spell_holy_holysmite',
    manaCost: 1000,
  },
  POWER_WORD_RADIANCE: {
    id: 194509,
    name: 'Power Word: Radiance',
    icon: 'spell_priest_power-word',
    manaCost: 11250,
  },
  SHADOW_MEND: {
    id: 186263,
    name: 'Shadow Mend',
    icon: 'spell_shadow_shadowmend',
    manaCost: 1750,
  },
  RAPTURE: {
    id: 47536,
    name: 'Rapture',
    icon: 'spell_holy_rapture',
    manaCost: 7750,
  },
  PAIN_SUPPRESSION: {
    id: 33206,
    name: 'Pain Suppression',
    icon: 'spell_holy_painsupression',
    manaCost: 800,
  },
  MASS_DISPEL: {
    id: 32375,
    name: 'Mass Dispel',
    icon: 'spell_arcane_massdispel',
    manaCost: 4000,
  },
  LEAP_OF_FAITH: {
    id: 73325,
    name: 'Leap of Faith',
    icon: 'priest_spell_leapoffaith_a',
    manaCost: 1300,
  },
  LEVITATE: {
    id: 1706,
    name: 'Levitate',
    icon: 'spell_holy_layonhands',
    manaCost: 450,
  },
  LIGHTS_WRATH: {
    id: 207946,
    name: "Light's Wrath",
    icon: 'inv_staff_2h_artifacttome_d_01',
  },
  MIND_CONTROL: {
    id: 605,
    name: 'Mind Control',
    icon: 'spell_shadow_shadowworddominate',
    manaCost: 1000,
  },
  POWER_WORD_BARRIER_CAST: {
    id: 62618,
    name: 'Power Word: Barrier',
    icon: 'spell_holy_powerwordbarrier',
    manaCost: 2000,
  },
  POWER_WORD_BARRIER_BUFF: {
    id: 81782,
    name: 'Power Word: Barrier',
    icon: 'spell_holy_powerwordbarrier',
  },
  WEAL_AND_WOE_BUFF: {
    id: 390787,
    name: 'Weal and Woe',
    icon: 'spell_priest_burningwill',
  },
  PURIFY: {
    id: 527,
    name: 'Purify',
    icon: 'spell_holy_dispelmagic',
    manaCost: 650,
  },
  SHACKLE_UNDEAD: {
    id: 9484,
    name: 'Shackle Undead',
    icon: 'spell_nature_slow',
    manaCost: 600,
  },
  SHADOWFIEND: {
    id: 34433,
    name: 'Shadowfiend',
    icon: 'spell_shadow_shadowfiend',
  },
  VOIDLING: {
    id: 254232,
    name: 'Voidling',
    icon: 'spell_shadow_shadowfiend',
  },
  LIGHTSPAWN: {
    id: 254224,
    name: 'Shadowfiend',
    icon: 'spell_shadow_shadowfiend',
  },
  LIGHTSPAWN_MELEE: {
    id: -2,
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
  PROTECTIVE_LIGHT_BUFF: {
    id: 193065,
    name: 'Protective Light',
    icon: 'spell_holy_holyprotection',
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
    manaCost: 600,
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
  HALO_DAMAGE: {
    id: 120696,
    name: 'Halo',
    icon: 'ability_priest_halo',
  },
  DIVINE_STAR_HEAL: {
    id: 110745,
    name: 'Halo',
    icon: 'spell_priest_divinestar',
  },
  DIVINE_STAR_DAMAGE: {
    id: 122128,
    name: 'Halo',
    icon: 'spell_priest_divinestar',
  },
  SHADOW_DIVINE_STAR_HEAL: {
    id: 390981,
    name: 'Divine Star',
    icon: 'spell_priest_divinestar_shadow2',
  },
  SHADOW_DIVINE_STAR_DAMAGE: {
    id: 390845,
    name: 'Divine Star',
    icon: 'spell_priest_divinestar_shadow2',
  },
  SHADOW_HALO_HEAL: {
    id: 390971,
    name: 'Halo',
    icon: 'ability_priest_halo_shadow',
  },
  SHADOW_HALO_DAMAGE: {
    id: 390964,
    name: 'Halo',
    icon: 'ability_priest_halo_shadow',
  },
  SHADOW_COVENANT_BUFF: {
    id: 322105,
    name: 'Shadow Covenant',
    icon: 'spell_shadow_summonvoidwalker',
  },
  CONTRITION_HEAL: {
    id: 270501,
    name: 'Contrition',
    icon: 'ability_priest_savinggrace',
  },
  CONTRITION_HEAL_CRIT: {
    id: 281469,
    name: 'Contrition',
    icon: 'ability_priest_savinggrace',
  },
  TWILIGHT_EQUILIBRIUM_SHADOW_BUFF: {
    id: 390707,
    name: 'Twilight Equilibrium',
    icon: 'ability_priest_innerlightandshadow',
  },
  TWILIGHT_EQUILIBRIUM_HOLY_BUFF: {
    id: 390706,
    name: 'Twilight Equilibrium',
    icon: 'ability_priest_innerlightandshadow',
  },
  MANIFESTED_TWILIGHT_BUFF_2P: {
    id: 363943,
    name: 'Manifested Twilight',
    icon: 'ability_priest_innerlightandshadow',
  },

  KAM_XIRAFF_BUFF: {
    id: 233997,
    name: "Kam Xi'raff",
    icon: 'ability_priest_savinggrace',
  },
  TWIST_OF_FATE_BUFF: {
    id: 390978,
    name: 'Twist of Fate',
    icon: 'spell_shadow_mindtwisting',
  },
  TWIST_OF_FATE_BUFF_DISCIPLINE: {
    id: 265258,
    name: 'Twist of Fate',
    icon: 'spell_shadow_mindtwisting',
  },
  ESTEL_DEJAHNAS_INSPIRATION_BUFF: {
    id: 214637,
    name: "Dejahna's Inspiration",
    icon: 'spell_holy_heal',
  },
  PRAYER_CIRCLE_BUFF: {
    id: 321379,
    name: 'Prayer Circle',
    icon: 'spell_paladin_divinecircle',
  },
  SANCTIFIED_PRAYERS_BUFF: {
    id: 196490,
    name: 'Sanctified Prayers',
    icon: 'spell_holy_pureofheart',
  },

  // Talents:
  // lv90
  PURGE_THE_WICKED_TALENT: {
    id: 204197,
    name: 'Purge the Wicked',
    icon: 'ability_mage_firestarter',
    manaCost: 900,
  },
  PURGE_THE_WICKED_BUFF: {
    id: 204213,
    name: 'Purge the Wicked',
    icon: 'ability_mage_firestarter',
  },
  HALO_TALENT: {
    id: 120517,
    name: 'Halo',
    icon: 'ability_priest_halo',
    manaCost: 1350,
  },
  EXPIATION_DAMAGE: {
    id: 390844,
    name: 'Expiation',
    icon: 'spell-shadow-shadowpower',
  },
  BURNING_VEHEMENCE_DAMAGE: {
    id: 400370,
    name: 'Burning Vehemence',
    icon: 'ability_paladin_sacredcleansing',
  },

  // Holy Priest Spells
  GREATER_HEAL: {
    id: 2060,
    name: 'Heal',
    icon: 'spell_holy_greaterheal',
    manaCost: 6000,
  },
  FLASH_HEAL: {
    id: 2061,
    name: 'Flash Heal',
    icon: 'spell_holy_flashheal',
    manaCost: 9000,
  },
  PRAYER_OF_MENDING_HEAL: {
    id: 33110,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },
  PRAYER_OF_MENDING_BUFF: {
    id: 41635,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },
  ECHO_OF_LIGHT_MASTERY: {
    id: 77485,
    name: 'Echo of Light',
    icon: 'spell_holy_aspiration',
  },
  ECHO_OF_LIGHT_HEAL: {
    id: 77489,
    name: 'Echo of Light',
    icon: 'spell_holy_aspiration',
  },
  GUARDIAN_SPIRIT_HEAL: {
    id: 48153,
    name: 'Guardian Spirit',
    icon: 'spell_holy_guardianspirit',
  },
  DIVINE_HYMN_HEAL: {
    id: 64844,
    name: 'Divine Hymn',
    icon: 'spell_holy_divinehymn',
  },
  HOLY_WORDS: {
    id: 63733,
    name: 'Holy Words',
    icon: 'spell_holy_serendipity',
  },
  HOLY_FIRE: {
    id: 14914,
    name: 'Holy Fire',
    icon: 'spell_holy_searinglight',
    manaCost: 2500,
  },
  TRAIL_OF_LIGHT_TALENT_HEAL: {
    id: 234946,
    name: 'Trail of Light',
    icon: 'ability_priest_wordsofmeaning',
  },
  COSMIC_RIPPLE_HEAL: {
    id: 243241,
    name: 'Cosmic Ripple Heal',
    icon: 'spell_holy_summonlightwell',
  },
  // Buffs
  SPIRIT_OF_REDEMPTION_BUFF: {
    id: 27827,
    name: 'Spirit of Redemption',
    icon: 'inv_enchant_essenceeternallarge',
  },
  LIGHTWEAVER_TALENT_BUFF: {
    id: 390993,
    name: 'Lightweaver',
    icon: 'spell_holy_greaterheal',
  },
  SURGE_OF_LIGHT_BUFF: {
    id: 114255,
    name: 'Surge of Light',
    icon: 'spell_holy_surgeoflight',
  },
  DIVINE_WORD_CHASTISE_TALENT_BUFF: {
    id: 372761,
    name: 'Divine Favor: Chastise',
    icon: 'priest_icon_chakra_red',
  },
  RESONANT_WORDS_TALENT_BUFF: {
    id: 372313,
    name: 'Resonant Words',
    icon: 'spell_holy_holybolt',
  },
  HEALING_CHORUS_TALENT_BUFF: {
    id: 390885,
    name: 'Healing Chorus',
    icon: 'spell_holy_circleofrenewal',
  },
  DIVINE_WORD_SERENITY_TALENT_BUFF: {
    id: 372791,
    name: 'Divine Favor: Serenity',
    icon: 'priest_icon_chakra',
  },
  // Sets
  HOLY_PRIEST_TIER_29_2_SET_BUFF: {
    id: 394729,
    name: 'Prayer Focus',
    icon: 'spell_priest_finalprayer',
  },
  HOLY_PRIEST_TIER_29_4_SET_BUFF: {
    id: 394745,
    name: 'Seize the moment',
    icon: 'inv_mace_1h_artifactheartofkure_d_03',
  },
  // Talents
  BINDING_HEALS_TALENT_HEAL: {
    id: 368276,
    name: 'Binding Heals',
    icon: 'spell_holy_blindingheal',
  },
  EMPOWERED_RENEW_TALENT_HEAL: {
    id: 391359,
    name: 'Empowered Renew',
    icon: 'ability_paladin_infusionoflight',
  },
  LIGHTWELL_TALENT_HEAL: {
    id: 372847,
    name: 'Lightwell',
    icon: 'spell_holy_summonlightwell',
  },
  HOLY_WORD_CHASTISE_CENSURE_TALENT_INCAPACITATE: {
    id: 200196,
    name: 'Holy Word: Chastise',
    icon: 'spell_holy_chastise',
    manaCost: 5000,
  },
  HOLY_WORD_CHASTISE_CENSURE_TALENT_STUN: {
    id: 200200,
    name: 'Holy Word: Chastise',
    icon: 'spell_holy_chastise',
    manaCost: 5000,
  },
  PONTIFEX_TALENT_BUFF: {
    id: 390989,
    name: 'Pontifex',
    icon: 'spell_priest_pontifex',
  },
  DIVINE_WORD_SANCTIFY_TALENT_HEAL: {
    id: 372787,
    name: 'Divine Word: Sanctuary',
    icon: 'priest_icon_chakra_blue',
  },
  // Shadow Spells
  MIND_BLAST: {
    id: 8092,
    name: 'Mind Blast',
    icon: 'spell_shadow_unholyfrenzy',
    manaCost: 1250,
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
  DEVOURING_PLAGUE: {
    id: 335467,
    name: 'Devouring Plague',
    icon: 'spell_shadow_devouringplague',
  },
  VOID_ERUPTION: {
    id: 228260,
    name: 'Void Eruption',
    icon: 'spell_priest_void-blast',
  },
  MASTERY_SHADOW_WEAVING: {
    id: 343690,
    name: 'Mastery: Shadow Weaving',
    icon: 'spell_shadow_shadetruesight',
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

  // Void torrent debuff applied on enemy
  VOID_TORRENT_BUFF: {
    id: 289577,
    name: 'Void Torrent',
    icon: 'spell_priest_voidsear',
  },

  VOID_BOLT: {
    id: 205448,
    name: 'Void Bolt',
    icon: 'ability_ironmaidens_convulsiveshadows',
  },

  VOID_BOLT_DISSONANT_ECHOES: {
    id: 343355,
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
  RESURRECTION: {
    id: 2006,
    name: 'Resurrection',
    icon: 'spell_holy_resurrection',
  },

  MIND_VISION: {
    id: 2096,
    name: 'Mind Vision',
    icon: 'spell_holy_mindvision',
    manaCost: 1000,
  },

  MIND_SEAR: {
    id: 48045,
    name: 'Mind Sear',
    icon: 'spell_shadow_mindshear',
    manaCost: 300,
  },

  SHADOWY_APPARITION: {
    id: 147193,
    name: 'Shadowy Apparition',
    icon: 'ability_priest_shadowyapparition',
  },

  SHADOWY_APPARITION_DAMAGE: {
    id: 148859,
    name: 'Shadowy Apparition',
    icon: 'ability_priest_shadowyapparition',
  },

  SHADOWY_APPARITION_CAST: {
    id: 341263,
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

  DARK_ASCENSION_BUFF: {
    id: 391109,
    name: 'Dark Ascension',
    icon: 'ability_priest_darkarchangel',
  },

  DARK_THOUGHTS: {
    id: 341205,
    name: 'Dark Thoughts',
    icon: 'ability_priest_thoughtsteal01',
  },

  DARK_THOUGHT_BUFF: {
    id: 341207,
    name: 'Dark Thought',
    icon: 'ability_priest_thoughtsteal01',
  },

  SHADOWY_INSIGHT: {
    id: 375888,
    name: 'Shadowy Insight',
    icon: 'spell_shadow_possession',
  },

  SHADOWY_INSIGHT_BUFF: {
    id: 375981,
    name: 'Shadowy Insight',
    icon: 'spell_shadow_possession',
  },

  SURGE_OF_DARKNESS_TALENT_BUFF: {
    id: 87160,
    name: 'Surge of Darkness',
    icon: 'ability_priest_surgeofdarkness',
  },

  UNFURLING_DARKNESS_BUFF: {
    id: 341282,
    name: 'Unfurling Darkness',
    icon: 'spell_priest_shadow-mend',
  },

  DEATHSPEAKER_TALENT_BUFF: {
    id: 392511,
    name: 'Deathspeaker',
    icon: 'spell_shadow_demonicfortitude',
  },

  MIND_DEVOURER_TALENT_BUFF: {
    id: 373204,
    name: 'Mind Devourer',
    icon: 'spell_arcane_mindmastery',
  },

  DEATH_AND_MADNESS_BUFF: {
    id: 321973,
    name: 'Death and Madness',
    icon: 'spell_shadow_painandsuffering',
  },

  DARK_EVANGELISM_TALENT_BUFF: {
    id: 391099,
    name: 'Dark Evangelism',
    icon: 'spell_mage_presenceofmind',
  },

  // Shadow items:

  SHADOW_CRASH_TALENT_DAMAGE: {
    id: 205386,
    name: 'Shadow Crash',
    icon: 'spell_shadow_shadowfury',
  },

  INESCAPABLE_TORMENT_TALENT_DAMAGE: {
    id: 373442,
    name: 'Inescapable Torment',
    icon: 'spell_shadow_chilltouch',
  },

  MIND_SEAR_TALENT_DAMAGE: {
    id: 49821,
    name: 'Mind Sear',
    icon: 'spell_shadow_mindshear',
    insanityCost: 0,
  },

  MIND_FLAY_INSANITY_TALENT_DAMAGE: {
    id: 391403,
    name: 'Mind Flay: Insanity',
    icon: 'spell_fire_twilightflamebreath',
  },

  MIND_FLAY_INSANITY_TALENT_BUFF: {
    id: 391401,
    name: 'Mind Flay: Insanity',
    icon: 'spell_fire_twilightflamebreath',
  },

  IDOL_OF_CTHUN_MIND_FLAY_DAMAGE: {
    id: 193473,
    name: 'Mind Flay',
    icon: 'spell_shadow_siphonmana',
  },

  IDOL_OF_CTHUN_MIND_SEAR_DAMAGE: {
    id: 394979,
    name: 'Mind Sear',
    icon: 'spell_shadow_siphonmana',
  },

  IDOL_OF_YOGG_SARON_VOID_SPIKE_DAMAGE: {
    id: 373279,
    name: 'Void Spike',
    icon: 'spell_priest_mindspike',
  },

  IDOL_OF_YOGG_SARON_VOID_SPIKE_CLEAVE_DAMAGE: {
    id: 396895,
    name: 'Void Spike',
    icon: 'spell_priest_mindspike',
  },

  IDOL_OF_NZOTH_DAMAGE: {
    id: 373304,
    name: 'Echoing Void',
    icon: 'inv_inscription_80_vantusrune_nyalotha',
  },

  IDOL_OF_YSHAARJ_BUFF_PRIDE: {
    id: 373316,
    name: 'Devoured Pride',
    icon: 'sha_ability_rogue_envelopingshadows',
  },

  IDOL_OF_YSHAARJ_BUFF_DESPAIR: {
    id: 373317,
    name: 'Devoured Despair',
    icon: 'sha_ability_rogue_envelopingshadows_nightborne',
  },

  IDOL_OF_YSHAARJ_BUFF_ANGER: {
    id: 373318,
    name: 'Devoured Anger',
    icon: 'sha_ability_rogue_envelopingshadows_nightmare',
  },

  IDOL_OF_YSHAARJ_BUFF_FEAR: {
    id: 373319,
    name: 'Devoured Fear',
    icon: 'sha_spell_warlock_demonsoul_nightborne',
  },

  IDOL_OF_YSHAARJ_BUFF_VIOLENCE: {
    id: 373320,
    name: 'Devoured Violence',
    icon: 'sha_spell_warlock_demonsoul',
  },
  //Shadow Tier
  SHADOW_PRIEST_TIER_29_4_SET_BUFF: {
    id: 394963,
    name: 'Dark Reveries',
    icon: 'inv_mace_1h_artifactheartofkure_d_05',
  },

  // Disc
  SPIRIT_SHELL_TALENT_BUFF: {
    id: 114908,
    name: 'Spirit Shell',
    icon: 'ability_shaman_astralshift.jpg',
  },
});

export default spells;
