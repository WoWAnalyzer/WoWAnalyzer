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
    lowRanks: [48119, 32546],
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
    id: 48300,
    name: 'Devouring Plague',
    icon: 'spell_shadow_devouringplague',
    lowRanks: [48299, 25467, 19280, 19279, 19278, 19277, 19276, 2944],
  },
  DISPEL_MAGIC: {
    id: 988,
    name: 'Dispel Magic',
    icon: 'spell_holy_dispelmagic',
    lowRanks: [527],
  },
  DIVINE_HYMN: {
    id: 64843,
    name: 'Divine Hymn',
    icon: 'spell_holy_divinehymn',
  },
  DIVINE_SPIRIT: {
    id: 48073,
    name: 'Divine Spirit',
    icon: 'spell_holy_divinespirit',
    lowRanks: [25312, 27841, 14819, 14818, 14752],
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
    id: 48071,
    name: 'Flash Heal',
    icon: 'spell_holy_flashheal',
    lowRanks: [48070, 25235, 25233, 10917, 10916, 10915, 9474, 9473, 9472, 2061],
  },
  GREATER_HEAL: {
    id: 48063,
    name: 'Greater Heal',
    icon: 'spell_holy_greaterheal',
    lowRanks: [48062, 25213, 25210, 25314, 10965, 10964, 10963, 2060],
  },
  HEAL: {
    id: 6064,
    name: 'Heal',
    icon: 'spell_holy_heal02',
    lowRanks: [6063, 2055, 2054],
  },
  HOLY_FIRE: {
    id: 48135,
    name: 'Holy Fire',
    icon: 'spell_holy_searinglight',
    lowRanks: [48134, 25384, 15261, 15267, 15266, 15265, 15264, 15263, 15262, 14914],
  },
  HOLY_NOVA: {
    id: 48078,
    name: 'Holy Nova',
    icon: 'spell_holy_holynova',
    lowRanks: [48077, 25331, 27801, 27800, 27799, 15431, 15430, 15237],
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
    id: 48168,
    name: 'Inner Fire',
    icon: 'spell_holy_innerfire',
    lowRanks: [48040, 25431, 10952, 10951, 1006, 602, 7128, 588],
  },
  LESSER_HEAL: {
    id: 2053,
    name: 'Lesser Heal',
    icon: 'spell_holy_lesserheal',
    lowRanks: [2052, 2050],
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
    id: 48127,
    name: 'Mind Blast',
    icon: 'spell_shadow_unholyfrenzy',
    lowRanks: [48126, 25375, 25372, 10947, 10946, 10945, 8106, 8105, 8104, 8103, 8102, 8092],
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
    lowRanks: [48045],
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
    lowRanks: [2096],
  },
  POWER_WORD_FORTITUDE: {
    id: 48161,
    name: 'Power Word: Fortitude',
    icon: 'spell_holy_wordfortitude',
    lowRanks: [25389, 10938, 10937, 2791, 1245, 1244, 1243],
  },
  POWER_WORD_SHIELD: {
    id: 48066,
    name: 'Power Word Shield',
    icon: 'spell_holy_powerwordshield',
    lowRanks: [48065, 25218, 25217, 10901, 10900, 10899, 10898, 6066, 6065, 3747, 600, 592, 17],
  },
  PRAYER_OF_FORTITUDE: {
    id: 48162,
    name: 'Prayer of Fortitude',
    icon: 'spell_holy_prayeroffortitude',
    lowRanks: [25392, 21564, 21562],
  },
  PRAYER_OF_HEALING: {
    id: 48072,
    name: 'Prayer of Healing',
    icon: 'spell_holy_prayerofhealing02',
    lowRanks: [25308, 10961, 25316, 10960, 996, 596],
  },
  PRAYER_OF_MENDING: {
    id: 48113,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
    lowRanks: [48112, 33076],
  },
  PRAYER_OF_SHADOW_PROTECTION: {
    id: 48170,
    name: 'Prayer of Shadow Protection',
    icon: 'spell_holy_prayerofshadowprotection',
    lowRanks: [39374, 27683],
  },
  PRAYER_OF_SPIRIT: {
    id: 48074,
    name: 'Prayer of Spirit',
    icon: 'spell_holy_prayerofspirit',
    lowRanks: [32999, 27681],
  },
  PSYCHIC_SCREAM: {
    id: 10890,
    name: 'Psychic Scream',
    icon: 'spell_shadow_psychicscream',
    lowRanks: [10888, 8124, 8122],
  },
  RENEW: {
    id: 48068,
    name: 'Renew',
    icon: 'spell_holy_renew',
    lowRanks: [48067, 25222, 25221, 25315, 10929, 10928, 10927, 6078, 6077, 6076, 6075, 6074, 139],
  },
  SHACKLE_UNDEAD: {
    id: 10955,
    name: 'Shackle Undead',
    icon: 'spell_nature_slow',
    lowRanks: [9485, 9484],
  },
  SHADOW_PROTECTION: {
    id: 48169,
    name: 'Shadow Protection',
    icon: 'spell_shadow_antishadow',
    lowRanks: [25433, 10958, 10957, 976],
  },
  SHADOW_WORD_DEATH: {
    id: 48158,
    name: 'Shadow Word Death',
    icon: 'spell_shadow_demonicfortitude',
    lowRanks: [48157, 32996, 32379],
  },
  SHADOW_WORD_PAIN: {
    id: 48125,
    name: 'Shadow Word Pain',
    icon: 'spell_shadow_shadowwordpain',
    lowRanks: [48124, 25368, 25367, 10894, 10893, 10892, 2767, 992, 970, 594, 589],
  },
  SHADOW_FIEND: {
    id: 34433,
    name: 'Shadowfiend',
    icon: 'spell_shadow_shadowfiend',
  },
  SMITE: {
    id: 48123,
    name: 'Smite',
    icon: 'spell_holy_holysmite',
    lowRanks: [48122, 25364, 25363, 10934, 10933, 6060, 1004, 984, 598, 591, 585],
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
  INNER_FOCUS: {
    id: 14751,
    name: 'Inner Focus',
    icon: 'spell_frost_windwalkon',
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
    lowRanks: [53006, 53005, 47540],
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
  CIRCLE_OF_HEALING: {
    id: 48089,
    name: 'Circle of Healing',
    icon: 'spell_holy_circleofrenewal',
    lowRanks: [48088, 34866, 34865, 34864, 34863, 34861],
  },
  DESPERATE_PRAYER: {
    id: 48173,
    name: 'Desperate Prayer',
    icon: 'spell_holy_restoration',
    lowRanks: [48172, 25437, 19243, 19242, 19241, 19240, 19238, 19236],
  },
  GUARDIAN_SPIRIT: {
    id: 47788,
    name: 'Guardian Spirit',
    icon: 'spell_holy_guardianspirit',
  },
  LIGHTWELL: {
    id: 48087,
    name: 'Lightwell',
    icon: 'spell_holy_summonlightwell',
    lowRanks: [48086, 28275, 27871, 27870, 724],
  },
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
    lowRanks: [48155, 25387, 18807, 17314, 17313, 17312, 17311, 15407],
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
    lowRanks: [48159, 34917, 34916, 34914],
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
