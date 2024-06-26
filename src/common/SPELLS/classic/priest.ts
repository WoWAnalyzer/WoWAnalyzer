/**
 * All WotLK Priest spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------
  ABOLISH_DISEASE: {
    id: 552,
    name: 'Abolish Disease',
    icon: 'spell_nature_nullifydisease',
  },
  BINDING_HEAL: {
    id: 48120,
    name: 'Binding Heal',
    icon: 'spell_holy_blindingheal',
  },
  BLESSED_HEALING: {
    id: 70772,
    name: 'Blessed Healing',
    icon: 'spell_holy_flashheal',
  },
  CURE_DISEASE: {
    id: 528,
    name: 'Cure Disease',
    icon: 'spell_holy_nullifydisease',
  },
  DEVOURING_PLAGUE: {
    id: 2944,
    name: 'Devouring Plague',
    icon: 'spell_shadow_devouringplague',
  },
  DISPEL_MAGIC: {
    id: 988,
    name: 'Dispel Magic',
    icon: 'spell_holy_dispelmagic',
  },
  DIVINE_HYMN: {
    id: 64843,
    name: 'Divine Hymn',
    icon: 'spell_holy_divinehymn',
  },
  DIVINE_HYMN_HEAL: {
    id: 64844,
    name: 'Divine Hymn',
    icon: 'spell_holy_divinehymn',
  },
  DIVINE_SPIRIT: {
    id: 48073,
    name: 'Divine Spirit',
    icon: 'spell_holy_divinespirit',
  },
  EMPOWERED_RENEW: {
    id: 63544,
    name: 'Empowered Renew',
    icon: 'ability_paladin_infusionoflight',
  },
  FADE: {
    id: 586,
    name: 'Fade',
    icon: 'spell_magic_lesserinvisibilty',
  },
  FEAR_WARD: {
    id: 6346,
    name: 'Fear Ward',
    icon: 'spell_holy_excorcism',
  },
  FLASH_HEAL: {
    id: 2061,
    name: 'Flash Heal',
    icon: 'spell_holy_flashheal',
  },
  // Separate spell when Surge of Light is active
  FLASH_HEAL_SURGE_OF_LIGHT: {
    id: 101062,
    name: 'Flash Heal',
    icon: 'spell_holy_flashheal',
  },
  GREATER_HEAL: {
    id: 48063,
    name: 'Greater Heal',
    icon: 'spell_holy_greaterheal',
  },
  HEAL: {
    id: 2050,
    name: 'Heal',
    icon: 'spell_holy_heal02',
  },
  HOLY_FIRE: {
    id: 14914,
    name: 'Holy Fire',
    icon: 'spell_holy_searinglight',
  },
  HOLY_NOVA: {
    id: 48078,
    name: 'Holy Nova',
    icon: 'spell_holy_holynova',
  },
  HYMN_OF_HOPE: {
    id: 64901,
    name: 'Hymn of Hope',
    icon: 'spell_holy_symbolofhope',
  },
  HYMN_OF_HOPE_BUFF: {
    id: 64904,
    name: 'Hymn of Hope',
    icon: 'spell_holy_rapture',
  },
  INNER_FIRE: {
    id: 588,
    name: 'Inner Fire',
    icon: 'spell_holy_innerfire',
  },
  INNER_FOCUS: {
    id: 89485,
    name: 'Inner Focus',
    icon: 'spell_frost_windwalkon',
  },
  LESSER_HEAL: {
    id: 2053,
    name: 'Lesser Heal',
    icon: 'spell_holy_lesserheal',
  },
  LEVITATE: {
    id: 1706,
    name: 'Levitate',
    icon: 'spell_holy_layonhands',
  },
  MANA_BURN: {
    id: 8129,
    name: 'Mana Burn',
    icon: 'spell_shadow_manaburn',
  },
  MASS_DISPEL: {
    id: 32375,
    name: 'Mass Dispel',
    icon: 'spell_arcane_massdispel',
  },
  MIND_BLAST: {
    id: 8092,
    name: 'Mind Blast',
    icon: 'spell_shadow_unholyfrenzy',
  },
  MIND_CONTROL: {
    id: 605,
    name: 'Mind Control',
    icon: 'spell_shadow_shadowworddominate',
  },
  MIND_SEAR: {
    id: 53023,
    name: 'Mind Sear',
    icon: 'spell_shadow_mindshear',
  },
  MIND_SOOTHE: {
    id: 453,
    name: 'Mind Soothe',
    icon: 'spell_holy_mindsooth',
  },
  MIND_VISION: {
    id: 10909,
    name: 'Mind Vision',
    icon: 'spell_holy_mindvision',
  },
  POWER_WORD_FORTITUDE: {
    id: 21562,
    name: 'Power Word: Fortitude',
    icon: 'spell_holy_wordfortitude',
  },
  POWER_WORD_SHIELD: {
    id: 17,
    name: 'Power Word Shield',
    icon: 'spell_holy_powerwordshield',
  },
  PRAYER_OF_HEALING: {
    id: 596,
    name: 'Prayer of Healing',
    icon: 'spell_holy_prayerofhealing02',
  },
  PRAYER_OF_MENDING: {
    id: 33076,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },
  PRAYER_OF_MENDING_HEAL: {
    id: 33110,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },
  PRAYER_OF_SHADOW_PROTECTION: {
    id: 48170,
    name: 'Prayer of Shadow Protection',
    icon: 'spell_holy_prayerofshadowprotection',
  },
  PRAYER_OF_SPIRIT: {
    id: 48074,
    name: 'Prayer of Spirit',
    icon: 'spell_holy_prayerofspirit',
  },
  PSYCHIC_SCREAM: {
    id: 10890,
    name: 'Psychic Scream',
    icon: 'spell_shadow_psychicscream',
  },
  RENEW: {
    id: 139,
    name: 'Renew',
    icon: 'spell_holy_renew',
  },
  SHACKLE_UNDEAD: {
    id: 10955,
    name: 'Shackle Undead',
    icon: 'spell_nature_slow',
  },
  SHADOW_PROTECTION: {
    id: 48169,
    name: 'Shadow Protection',
    icon: 'spell_shadow_antishadow',
  },
  SHADOW_WORD_DEATH: {
    id: 48158,
    name: 'Shadow Word Death',
    icon: 'spell_shadow_demonicfortitude',
  },
  SHADOW_WORD_PAIN: {
    id: 589,
    name: 'Shadow Word Pain',
    icon: 'spell_shadow_shadowwordpain',
  },
  SHADOW_FIEND: {
    id: 34433,
    name: 'Shadowfiend',
    icon: 'spell_shadow_shadowfiend',
  },
  SMITE: {
    id: 585,
    name: 'Smite',
    icon: 'spell_holy_holysmite',
  },
  // ---------
  // TALENTS
  // ---------
  // Discipline
  BORROWED_TIME: {
    id: 59891,
    name: 'Borrowed Time',
    icon: 'spell_holy_borrowedtime',
  },
  PAIN_SUPPRESSION: {
    id: 33206,
    name: 'Pain Suppression',
    icon: 'spell_holy_painsupression',
  },
  PENANCE: {
    id: 53007,
    name: 'Penance',
    icon: 'spell_holy_penance',
  },
  PENANCE_DAMAGE: {
    id: 53000,
    name: 'Penance',
    icon: 'spell_holy_penance',
  },
  PENANCE_HEALING: {
    id: 52985,
    name: 'Penance',
    icon: 'spell_holy_penance',
  },
  POWER_INFUSION: {
    id: 10060,
    name: 'Power Infusion',
    icon: 'spell_holy_powerinfusion',
  },
  RAPTURE: {
    id: 63654,
    name: 'Rapture',
    icon: 'spell_holy_rapture',
  },
  RENEWED_HOPE_TALENT: {
    id: 57470,
    name: 'Renewed Hope',
    icon: 'spell_holy_holyprotection',
  },
  // Holy

  CHAKRA: { id: 14751, name: 'Chakra', icon: 'spell_frost_windwalkon.jpg' },
  CHAKRA_SERENITY_BUFF: {
    id: 81208,
    name: 'Chakra: Serenity',
    icon: 'priest_icon_chakra',
  },
  CHAKRA_SANCTUARY_BUFF: {
    id: 81206,
    name: 'Chakra: Sanctuary',
    icon: 'priest_icon_chakra_blue',
  },
  CHAKRA_CHASTISE_BUFF: {
    id: 81209,
    name: 'Chakra: Chastise',
    icon: 'priest_icon_chakra_red',
  },
  CIRCLE_OF_HEALING: {
    id: 34861,
    name: 'Circle of Healing',
    icon: 'spell_holy_circleofrenewal',
  },
  DESPERATE_PRAYER: {
    id: 19236,
    name: 'Desperate Prayer',
    icon: 'spell_holy_restoration',
  },
  GUARDIAN_SPIRIT: {
    id: 47788,
    name: 'Guardian Spirit',
    icon: 'spell_holy_guardianspirit',
  },
  LIGHTWELL: {
    id: 724,
    name: 'Lightwell',
    icon: 'spell_holy_summonlightwell',
  },
  LIGHTWELL_HEAL: {
    id: 7001,
    name: 'Lightwell',
    icon: 'spell_holy_summonlightwell',
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
  HOLY_WORD_CHASTISE: { id: 88625, name: 'Holy Word: Chastise', icon: 'spell_holy_chastise.jpg' },
  // Shadow
  DISPERSION: {
    id: 47585,
    name: 'Dispersion',
    icon: 'spell_shadow_dispersion',
  },
  MIND_FLAY: {
    id: 48156,
    name: 'Mind Flay',
    icon: 'spell_shadow_siphonmana',
  },
  PAIN_AND_SUFFERING_TALENT: {
    id: 47582,
    name: 'Pain and Suffering',
    icon: 'spell_shadow_painandsuffering',
  },
  PSYCHIC_HORROR: {
    id: 64044,
    name: 'Psychic Horror',
    icon: 'spell_shadow_psychichorrors',
  },
  SHADOWFORM: {
    id: 15473,
    name: 'Shadowform',
    icon: 'spell_shadow_shadowform',
  },
  SHADOW_WEAVING_BUFF: {
    id: 15258,
    name: 'Shadow Weaving',
    icon: 'spell_shadow_blackplague',
  },
  SHADOW_WEAVING_TALENT: {
    id: 15332,
    name: 'Shadow Weaving',
    icon: 'spell_shadow_blackplague',
  },
  SILENCE: {
    id: 15487,
    name: 'Silence',
    icon: 'spell_shadow_impphaseshift',
  },
  VAMPIRIC_EMBRACE: {
    id: 15286,
    name: 'Vampiric Embrace',
    icon: 'spell_shadow_unsummonbuilding',
  },
  VAMPIRIC_TOUCH: {
    id: 48160,
    name: 'Vampiric Touch',
    icon: 'spell_holy_stoicism',
  },
  // -----
  // PET
  // -----
  SHADOW_FIEND_MANA_LEECH: {
    id: 34650,
    name: 'Shadow Fiend Mana Leech',
    icon: 'spell_shadow_siphonmana',
  },
} satisfies Record<string, Spell>;

export default spells;
