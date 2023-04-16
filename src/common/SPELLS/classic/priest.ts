import { spellIndexableList } from '../Spell';

const spells = spellIndexableList({
  GREATER_HEAL: {
    id: 48063,
    name: 'Greater Heal',
    icon: 'spell_holy_greaterheal',
  },
  RENEW: {
    id: 48068,
    name: 'Renew',
    icon: 'spell_holy_renew',
  },
  POWER_WORD_SHIELD: {
    id: 48066,
    name: 'Power Word: Shield',
    icon: 'spell_holy_powerwordshield',
  },
  CIRCLE_OF_HEALING: {
    id: 48089,
    name: 'Circle of Healing',
    icon: 'spell_holy_circleofrenewal',
  },
  PRAYER_OF_MENDING: {
    id: 48113,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },
  PRAYER_OF_HEALING: {
    id: 48072,
    name: 'Prayer of Healing',
    icon: 'spell_holy_prayerofhealing02',
  },
  RENEWED_HOPE_TALENT: {
    id: 57470,
    name: 'Renewed Hope',
    icon: 'spell_holy_holyprotection',
  },
  FLASH_HEAL: {
    id: 48071,
    name: 'Flash Heal',
    icon: 'spell_holy_flashheal',
  },
  BINDING_HEAL: {
    id: 48120,
    name: 'Binding Heal',
    icon: 'spell_holy_blindingheal',
  },
  SHADOW_WORD_PAIN: {
    id: 48125,
    name: 'Shadow Word: Pain',
    icon: 'spell_shadow_shadowwordpain',
    lowRanks: [589, 594, 970, 992, 2767, 10893, 10894, 25367, 25368, 48124],
  },
  MIND_BLAST: {
    id: 48127,
    name: 'Mind Blast',
    icon: 'spell_shadow_unholyfrenzy',
    lowRanks: [8092, 8102, 8103, 8104, 8105, 8106, 10945, 10946, 10947, 25372, 25375, 25372, 48126],
  },
  SHADOW_WORD_DEATH: {
    id: 48158,
    name: 'Shadow Word: Death',
    icon: 'spell_shadow_demonicfortitude',
    lowRanks: [32379, 32996, 48157],
  },
  SMITE: {
    id: 48123,
    name: 'Smite',
    icon: 'spell_holy_holysmite',
  },
  HOLY_FIRE: {
    id: 48135,
    name: 'Holy Fire',
    icon: 'spell_holy_searinglight',
  },
  LIGHTWELL: {
    id: 48087,
    name: 'Lightwell',
    icon: 'spell_holy_summonlightwell',
  },
  DEVOURING_PLAGUE: {
    id: 48300,
    name: 'Devouring Plague',
    icon: 'spell_shadow_devouringplague',
    lowRanks: [2944, 19276, 19277, 19278, 19279, 19280, 25467, 48299],
  },
  DESPERATE_PRAYER: {
    id: 48173,
    name: 'Desperate Prayer',
    icon: 'spell_holy_restoration',
  },
  HOLY_NOVA: {
    id: 48078,
    name: 'Holy Nova',
    icon: 'spell_holy_holynova',
  },
  POWER_WORD_FORTITUDE: {
    id: 48161,
    name: 'Power Word: Fortitude',
    icon: 'spell_holy_wordfortitude',
  },
  SHADOW_PROTECTION: {
    id: 48169,
    name: 'Shadow Protection',
    icon: 'spell_shadow_antishadow',
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
  },
  PRAYER_OF_FORTITUDE: {
    id: 48162,
    name: 'Prayer of Fortitude',
    icon: 'spell_holy_prayeroffortitude',
  },
  PRAYER_OF_SPIRIT: {
    id: 48074,
    name: 'Prayer of Spirit',
    icon: 'spell_holy_prayerofspirit',
  },
  PRAYER_OF_SHADOW_PROTECTION: {
    id: 48170,
    name: 'Prayer of Shadow Protection',
    icon: 'spell_holy_prayerofshadowprotection',
  },
  PENANCE: {
    id: 53003,
    name: 'Penance',
    icon: 'spell_holy_penance',
  },
  PENANCE_HEALING: {
    id: 52985,
    name: 'Penance',
    icon: 'spell_holy_penance',
  },
  PENANCE_DAMAGE: {
    id: 53000,
    name: 'Penance',
    icon: 'spell_holy_penance',
  },
  VAMPIRIC_TOUCH: {
    id: 48160,
    name: 'Vampiric Touch',
    icon: 'spell_holy_stoicism',
    lowRanks: [34914, 34916, 34917, 48159],
  },
  VAMPIRIC_EMBRACE: {
    id: 15286,
    name: 'Vampiric Embrace',
    icon: 'spell_shadow_unsummonbuilding',
  },
  MIND_FLAY: {
    id: 48156,
    name: 'Mind Flay',
    icon: 'spell_shadow_siphonmana',
    lowRanks: [15407, 17311, 17312, 17313, 17314, 18807, 25387, 48155],
  },
  RAPTURE: {
    id: 63654,
    name: 'Rapture',
    icon: 'spell_holy_rapture',
  },
  HYMN_OF_HOPE: {
    id: 64901,
    name: 'Hymn of Hope',
    icon: 'spell_holy_symbolofhope',
  },
  HYMN_OF_HOPE_BUFF: {
    id: 64904,
    name: 'Hymn of Hope',
    icon: 'spell_holy_symbolofhope',
  },
  SHADOW_WEAVING_TALENT: {
    id: 15332,
    name: 'Shadow Weaving',
    icon: 'spell_shadow_blackplague',
  },
  SHADOW_WEAVING_BUFF: {
    id: 15258,
    name: 'Shadow Weaving',
    icon: 'spell_shadow_blackplague',
  },
  PAIN_AND_SIFFERING_TALENT: {
    id: 47582,
    name: 'Pain and Suffering',
    icon: 'spell_shadow_painandsuffering',
  },
  SHADOW_FIEND: {
    id: 34433,
    name: 'Shadow Fiend',
    icon: 'spell_shadow_shadowfiend',
  },
  SHADOW_FIEND_MANA_LEECH: {
    id: 34650,
    name: 'Shadow Fiend Mana Leech',
    icon: 'spell_shadow_siphonmana',
  },
  DISPERSION: {
    id: 47585,
    name: 'Dispersion',
    icon: 'spell_shadow_dispersion',
  },
  MIND_SEAR: {
    id: 53023,
    name: 'Mind Sear',
    icon: 'spell_shadow_mindshear',
    lowRanks: [48045],
  },
});

export default spells;
