/**
 * All Priest abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { SpellList, PriestSpell } from "./Spell";
const spells: SpellList<PriestSpell> = {
  // Shared
  HOLY_NOVA: {
    id: 132157,
    name: 'Holy Nova',
    icon: 'spell_holy_holynova',
    manaCost: 800,
  },
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
  SHADOW_WORD_DEATH: {
    id: 32379,
    name: 'Shadow Word: Death',
    icon: 'spell_shadow_demonicfortitude',
    manaCost: 800,
  },
  POWER_INFUSION: {
    id: 265314,
    name: 'Power Infusion',
    icon: 'spell_holy_powerinfusion',
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
    manaCost: 800,
    coefficient: 0.4,
  },
  PENANCE_HEAL: {
    // Penance on a friendly player
    id: 47750,
    name: 'Penance',
    icon: 'spell_holy_penance',
    manaCost: 800,
  },
  PENANCE_CAST: {
    id: 47540,
    name: 'Penance',
    icon: 'spell_holy_penance',
    manaCost: 800,
  },
  POWER_WORD_SHIELD: {
    id: 17,
    name: 'Power Word: Shield',
    icon: 'spell_holy_powerwordshield',
    manaCost: 1550,
    atonementDuration: 15000,
  },
  SMITE: {
    id: 585,
    name: 'Smite',
    icon: 'spell_holy_holysmite',
    manaCost: 200,
    coefficient: 0.47,
  },
  POWER_WORD_RADIANCE: {
    id: 194509,
    name: 'Power Word: Radiance',
    icon: 'spell_priest_power-word',
    manaCost: 3250,
    atonementDuration: 9000,
  },
  SHADOW_MEND: {
    id: 186263,
    name: 'Shadow Mend',
    icon: 'spell_shadow_shadowmend',
    atonementDuration: 15000,
    manaCost: 1750,
  },
  RAPTURE: {
    id: 47536,
    name: 'Rapture',
    icon: 'spell_holy_rapture',
    manaCost: 1550,
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
  DISPEL_MAGIC: {
    id: 528,
    name: 'Dispel Magic',
    icon: 'spell_nature_nullifydisease',
    manaCost: 800,
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
    name: 'Light\'s Wrath',
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
  TWIST_OF_FATE_BUFF_DISCIPLINE: {
    id: 265258,
    name: 'Twist of Fate',
    icon: 'spell_shadow_mindtwisting',
  },
  ESTEL_DEJAHNAS_INSPIRATION_BUFF: {
    id: 214637,
    name: 'Dejahna\'s Inspiration',
    icon: 'spell_holy_heal',
  },
  PRAYER_CIRCLE_BUFF: {
    id: 321379,
    name: 'Prayer Circle',
    icon: 'spell_paladin_divinecircle',
  },

  // Talents:
  // lv90
  PURGE_THE_WICKED_TALENT: {
    id: 204197,
    name: 'Purge the Wicked',
    icon: 'ability_mage_firestarter',
    manaCost: 22000,
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
    manaCost: 2700,
  },

  // Holy Priest Spells
  GREATER_HEAL: {
    id: 2060,
    name: 'Heal',
    icon: 'spell_holy_greaterheal',
    manaCost: 1900,
  },
  CIRCLE_OF_HEALING_TALENT: {
    id: 204883,
    name: 'Circle of Healing',
    icon: 'spell_holy_circleofrenewal',
    manaCost: 1650,
  },
  FLASH_HEAL: {
    id: 2061,
    name: 'Flash Heal',
    icon: 'spell_holy_flashheal',
    manaCost: 3000,
  },
  PRAYER_OF_MENDING_CAST: {
    id: 33076,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
    manaCost: 1000,
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
  PRAYER_OF_HEALING: {
    id: 596,
    name: 'Prayer of Healing',
    icon: 'spell_holy_prayerofhealing02',
    manaCost: 2500,
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
  RENEW: {
    id: 139,
    name: 'Renew',
    icon: 'spell_holy_renew',
    manaCost: 900,
  },
  HOLY_WORD_SERENITY: {
    id: 2050,
    name: 'Holy Word: Serenity',
    icon: 'spell_holy_persuitofjustice',
    manaCost: 2000,
  },
  HOLY_WORD_SANCTIFY: {
    id: 34861,
    name: 'Holy Word: Sanctify',
    icon: 'spell_holy_divineprovidence',
    manaCost: 2500,
  },
  GUARDIAN_SPIRIT: {
    id: 47788,
    name: 'Guardian Spirit',
    icon: 'spell_holy_guardianspirit',
    manaCost: 450,
  },
  GUARDIAN_SPIRIT_HEAL: {
    id: 48153,
    name: 'Guardian Spirit',
    icon: 'spell_holy_guardianspirit',
  },
  DIVINE_HYMN_CAST: {
    id: 64843,
    name: 'Divine Hymn',
    icon: 'spell_holy_divinehymn',
    manaCost: 2200,
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
    manaCost: 500,
  },
  HOLY_WORD_CHASTISE: {
    id: 88625,
    name: 'Holy Word: Chastise',
    icon: 'spell_holy_chastise',
    manaCost: 1000,
  },
  HOLY_WORD_CHASTISE_CENSURE_INCAPACITATE: {
    id: 200196,
    name: 'Holy Word: Chastise',
    icon: 'spell_holy_chastise',
    manaCost: 1000,
  },
  HOLY_WORD_CHASTISE_CENSURE_STUN: {
    id: 200200,
    name: 'Holy Word: Chastise',
    icon: 'spell_holy_chastise',
    manaCost: 1000,
  },
  SYMBOL_OF_HOPE: {
    id: 64901,
    name: 'Symbol of Hope',
    icon: 'spell_holy_symbolofhope',
  },
  TRAIL_OF_LIGHT_HEAL: {
    id: 234946,
    name: 'Trail of Light',
    icon: 'ability_priest_wordsofmeaning',
  },
  SURGE_OF_LIGHT_BUFF: {
    id: 114255,
    name: 'Surge of Light',
    icon: 'spell_holy_surgeoflight',
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

  UNFURLING_DARKNESS_BUFF: {
    id: 341282,
    name: 'Unfurling Darkness',
    icon: 'spell_priest_shadow-mend',
  },

  // Shadow items:

  SHADOW_CRASH_TALENT_DAMAGE: {
    id: 205386,
    name: 'Shadow Crash',
    icon: 'spell_shadow_shadowfury',
  },

};
export default spells;
