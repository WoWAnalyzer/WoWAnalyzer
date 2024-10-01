/**
 * All Classic Priest spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------
  BINDING_HEAL: {
    id: 32546,
    name: 'Binding Heal',
    icon: 'spell_holy_blindingheal.jpg',
  },
  BLESSED_HEALING: {
    id: 70772,
    name: 'Blessed Healing',
    icon: 'spell_holy_flashheal.jpg',
  },
  CURE_DISEASE: {
    id: 528,
    name: 'Cure Disease',
    icon: 'spell_holy_nullifydisease.jpg',
  },
  DEVOURING_PLAGUE: {
    id: 2944,
    name: 'Devouring Plague',
    icon: 'spell_shadow_devouringplague.jpg',
  },
  DISPEL_MAGIC: {
    id: 527,
    name: 'Dispel Magic',
    icon: 'spell_holy_dispelmagic.jpg',
  },
  DIVINE_HYMN: {
    id: 64843,
    name: 'Divine Hymn',
    icon: 'spell_holy_divinehymn.jpg',
  },
  DIVINE_HYMN_HEAL: {
    id: 64844,
    name: 'Divine Hymn',
    icon: 'spell_holy_divineprovidence.jpg',
  },
  DIVINE_TOUCH: {
    id: 63544,
    name: 'Divine Touch',
    icon: 'ability_paladin_infusionoflight.jpg',
  },
  FADE: {
    id: 586,
    name: 'Fade',
    icon: 'spell_magic_lesserinvisibilty.jpg',
  },
  FEAR_WARD: {
    id: 6346,
    name: 'Fear Ward',
    icon: 'spell_holy_excorcism.jpg',
  },
  FLASH_HEAL: {
    id: 2061,
    name: 'Flash Heal',
    icon: 'spell_holy_flashheal.jpg',
  },
  // Separate spell when Surge of Light is active
  FLASH_HEAL_SURGE_OF_LIGHT: {
    id: 101062,
    name: 'Flash Heal',
    icon: 'spell_holy_flashheal.jpg',
  },
  GREATER_HEAL: {
    id: 2060,
    name: 'Greater Heal',
    icon: 'spell_holy_greaterheal.jpg',
  },
  HEAL: {
    id: 2050,
    name: 'Heal',
    icon: 'spell_holy_lesserheal.jpg',
  },
  HOLY_FIRE: {
    id: 14914,
    name: 'Holy Fire',
    icon: 'spell_holy_searinglight.jpg',
  },
  HOLY_NOVA: {
    id: 15237,
    name: 'Holy Nova',
    icon: 'spell_holy_holynova.jpg',
  },
  HYMN_OF_HOPE: {
    id: 64901,
    name: 'Hymn of Hope',
    icon: 'spell_holy_symbolofhope.jpg',
  },
  HYMN_OF_HOPE_BUFF: {
    id: 64904,
    name: 'Hymn of Hope',
    icon: 'spell_holy_rapture.jpg',
  },
  INNER_FIRE: {
    id: 588,
    name: 'Inner Fire',
    icon: 'spell_holy_innerfire.jpg',
  },
  INNER_WILL: {
    id: 73413,
    name: 'Inner Will',
    icon: 'priest_icon_innewill.jpg',
  },
  LEAP_OF_FAITH: {
    id: 73325,
    name: 'Leap of Faith',
    icon: 'priest_spell_leapoffaith_a.jpg',
  },
  LEVITATE: {
    id: 1706,
    name: 'Levitate',
    icon: 'spell_holy_layonhands.jpg',
  },
  MANA_BURN: {
    id: 8129,
    name: 'Mana Burn',
    icon: 'spell_shadow_manaburn.jpg',
  },
  MASS_DISPEL: {
    id: 32375,
    name: 'Mass Dispel',
    icon: 'spell_arcane_massdispel.jpg',
  },
  MIND_BLAST: {
    id: 8092,
    name: 'Mind Blast',
    icon: 'spell_shadow_unholyfrenzy.jpg',
  },
  MIND_CONTROL: {
    id: 605,
    name: 'Mind Control',
    icon: 'spell_shadow_shadowworddominate.jpg',
  },
  MIND_SEAR: {
    id: 48045,
    name: 'Mind Sear',
    icon: 'spell_shadow_mindshear.jpg',
  },
  MIND_SEAR_TICK: {
    id: 49821,
    name: 'Mind Sear',
    icon: 'spell_shadow_mindshear.jpg',
  },
  MIND_SOOTHE: {
    id: 453,
    name: 'Mind Soothe',
    icon: 'spell_holy_mindsooth.jpg',
  },
  MIND_SPIKE: {
    id: 73510,
    name: 'Mind Spike',
    icon: 'spell_priest_mindspike.jpg',
  },
  MIND_VISION: {
    id: 2096,
    name: 'Mind Vision',
    icon: 'spell_holy_mindvision.jpg',
  },
  POWER_WORD_FORTITUDE: {
    id: 21562,
    name: 'Power Word: Fortitude',
    icon: 'spell_holy_wordfortitude.jpg',
  },
  POWER_WORD_SHIELD: {
    id: 17,
    name: 'Power Word Shield',
    icon: 'spell_holy_powerwordshield.jpg',
  },
  PRAYER_OF_HEALING: {
    id: 596,
    name: 'Prayer of Healing',
    icon: 'spell_holy_prayerofhealing02.jpg',
  },
  PRAYER_OF_MENDING: {
    id: 33076,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga.jpg',
  },
  PRAYER_OF_MENDING_HEAL: {
    id: 33110,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga.jpg',
  },
  PSYCHIC_SCREAM: {
    id: 8122,
    name: 'Psychic Scream',
    icon: 'spell_shadow_psychicscream.jpg',
  },
  RENEW: {
    id: 139,
    name: 'Renew',
    icon: 'spell_holy_renew.jpg',
  },
  SHACKLE_UNDEAD: {
    id: 9484,
    name: 'Shackle Undead',
    icon: 'spell_nature_slow.jpg',
  },
  SHADOW_PROTECTION: {
    id: 27683,
    name: 'Shadow Protection',
    icon: 'spell_holy_prayerofshadowprotection.jpg',
  },
  SHADOW_WORD_DEATH: {
    id: 32379,
    name: 'Shadow Word Death',
    icon: 'spell_shadow_demonicfortitude.jpg',
  },
  SHADOW_WORD_PAIN: {
    id: 589,
    name: 'Shadow Word Pain',
    icon: 'spell_shadow_shadowwordpain.jpg',
  },
  SHADOW_FIEND: {
    id: 34433,
    name: 'Shadowfiend',
    icon: 'spell_shadow_shadowfiend.jpg',
  },
  SMITE: {
    id: 585,
    name: 'Smite',
    icon: 'spell_holy_holysmite.jpg',
  },
  // ---------
  // TALENTS
  // ---------
  // Discipline
  ARCHANGEL: {
    id: 87151,
    name: 'Archangel',
    icon: 'ability_priest_archangel.jpg',
  },
  BORROWED_TIME_7: {
    id: 59887,
    name: 'Borrowed Time',
    icon: 'spell_holy_borrowedtime.jpg',
  },
  BORROWED_TIME_14: {
    id: 59888,
    name: 'Borrowed Time',
    icon: 'spell_holy_borrowedtime.jpg',
  },
  BORROWED_TIME_15: {
    id: 59889,
    name: 'Borrowed Time',
    icon: 'spell_holy_borrowedtime.jpg',
  },
  INNER_FOCUS: {
    id: 89485,
    name: 'Inner Focus',
    icon: 'spell_frost_windwalkon.jpg',
  },
  PAIN_SUPPRESSION: {
    id: 33206,
    name: 'Pain Suppression',
    icon: 'spell_holy_painsupression.jpg',
  },
  PENANCE: {
    id: 47540,
    name: 'Penance',
    icon: 'spell_holy_penance.jpg',
  },
  PENANCE_DAMAGE: {
    id: 47666,
    name: 'Penance',
    icon: 'spell_holy_penance.jpg',
  },
  PENANCE_HEALING: {
    id: 47750,
    name: 'Penance',
    icon: 'spell_holy_penance.jpg',
  },
  POWER_INFUSION: {
    id: 10060,
    name: 'Power Infusion',
    icon: 'spell_holy_powerinfusion.jpg',
  },
  RAPTURE: {
    id: 47755,
    name: 'Rapture',
    icon: 'spell_holy_rapture.jpg',
  },
  POWER_WORD_BARRIER: {
    id: 62618,
    name: 'Power Word: Barrier',
    icon: 'spell_holy_holyprotection',
  },
  // Holy
  CHAKRA: {
    id: 14751,
    name: 'Chakra',
    icon: 'spell_frost_windwalkon.jpg',
  },
  CHAKRA_CHASTISE_BUFF: {
    id: 81209,
    name: 'Chakra: Chastise',
    icon: 'priest_icon_chakra_red.jpg',
  },
  CHAKRA_SANCTUARY_BUFF: {
    id: 81206,
    name: 'Chakra: Sanctuary',
    icon: 'priest_icon_chakra_blue.jpg',
  },
  CHAKRA_SERENITY_BUFF: {
    id: 81208,
    name: 'Chakra: Serenity',
    icon: 'priest_icon_chakra.jpg',
  },
  CIRCLE_OF_HEALING: {
    id: 34861,
    name: 'Circle of Healing',
    icon: 'spell_holy_circleofrenewal.jpg',
  },
  DESPERATE_PRAYER: {
    id: 19236,
    name: 'Desperate Prayer',
    icon: 'spell_holy_restoration.jpg',
  },
  GUARDIAN_SPIRIT: {
    id: 47788,
    name: 'Guardian Spirit',
    icon: 'spell_holy_guardianspirit.jpg',
  },
  HOLY_WORD_CHASTISE: {
    id: 88625,
    name: 'Holy Word: Chastise',
    icon: 'spell_holy_chastise.jpg',
  },
  HOLY_WORD_SANCTUARY: {
    id: 88685,
    name: 'Holy Word: Sanctuary',
    icon: 'spell_holy_divineprovidence.jpg',
  },
  HOLY_WORD_SANCTUARY_HEAL: {
    id: 88686,
    name: 'Holy Word: Sanctuary',
    icon: 'spell_holy_divineprovidence.jpg',
  },
  HOLY_WORD_SERENITY: {
    id: 88684,
    name: 'Holy Word: Serenity',
    icon: 'spell_holy_persuitofjustice.jpg',
  },
  LIGHTWELL: {
    id: 724,
    name: 'Lightwell',
    icon: 'spell_holy_summonlightwell.jpg',
  },
  LIGHTWELL_HEAL: {
    id: 7001,
    name: 'Lightwell',
    icon: 'spell_holy_summonlightwell.jpg',
  },
  // Shadow
  DISPERSION: {
    id: 47585,
    name: 'Dispersion',
    icon: 'spell_shadow_dispersion.jpg',
  },
  MIND_FLAY: {
    id: 15407,
    name: 'Mind Flay',
    icon: 'spell_shadow_siphonmana.jpg',
  },
  PAIN_AND_SUFFERING_TALENT: {
    id: 47581,
    name: 'Pain and Suffering.jpg',
    icon: 'spell_shadow_painandsuffering.jpg',
  },
  PSYCHIC_HORROR: {
    id: 64044,
    name: 'Psychic Horror',
    icon: 'spell_shadow_psychichorrors.jpg',
  },
  SHADOWFORM: {
    id: 15473,
    name: 'Shadowform',
    icon: 'spell_shadow_shadowform.jpg',
  },
  SHADOW_WEAVING_BUFF: {
    // TODO: Remove when updating Shadow spec
    id: 15258,
    name: 'Shadow Weaving',
    icon: 'spell_shadow_blackplague',
  },
  SHADOW_WEAVING_TALENT: {
    // TODO: Remove when updating Shadow spec
    id: 15332,
    name: 'Shadow Weaving',
    icon: 'spell_shadow_blackplague',
  },
  SILENCE: {
    id: 15487,
    name: 'Silence',
    icon: 'ability_priest_silence.jpg',
  },
  VAMPIRIC_EMBRACE: {
    id: 15286,
    name: 'Vampiric Embrace',
    icon: 'spell_shadow_unsummonbuilding.jpg',
  },
  VAMPIRIC_TOUCH: {
    id: 34914,
    name: 'Vampiric Touch',
    icon: 'spell_holy_stoicism.jpg',
  },
  // -----
  // PET
  // -----
  SHADOW_FIEND_MANA_LEECH: {
    id: 34650,
    name: 'Shadow Fiend Mana Leech',
    icon: 'spell_shadow_shadowmend.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
