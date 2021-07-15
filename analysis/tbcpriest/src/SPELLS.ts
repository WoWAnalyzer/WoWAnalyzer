const spells = {
  FLASH_HEAL: { id: 25235, name: 'Flash Heal', icon: 'spell_holy_flashheal' },
  GREATER_HEAL: { id: 25213, name: 'Greater Heal', icon: 'spell_holy_greaterheal' },
  RENEW: { id: 25222, name: 'Renew', icon: 'spell_holy_renew' },
  POWER_WORD_SHIELD: { id: 25218, name: 'Power Word Shield', icon: 'spell_holy_powerwordshield' },
  BINDING_HEAL: { id: 32546, name: 'Binding Heal', icon: 'spell_holy_blindingheal' },
  PRAYER_OF_MENDING: {
    id: 33076,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },
  PRAYER_OF_HEALING: { id: 25308, name: 'Prayer of Healing', icon: 'spell_holy_prayerofhealing02' },
  PRAYER_OF_MENDING_BUFF: {
    id: 41635,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },
  PRAYER_OF_MENDING_HEAL: {
    id: 33110,
    name: 'Prayer of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },

  SHADOW_WORD_PAIN: { id: 25368, name: 'Shadow Word Pain', icon: 'spell_shadow_shadowwordpain' },
  MIND_BLAST: { id: 25375, name: 'Mind Blast', icon: 'spell_shadow_unholyfrenzy' },
  SHADOW_WORD_DEATH: {
    id: 32996,
    name: 'Shadow Word: Death',
    icon: 'spell_shadow_demonicfortitude',
  },
  SMITE: { id: 25364, name: 'Smite', icon: 'spell_holy_holysmite' },
  HOLY_FIRE: { id: 25384, name: 'Holy Fire', icon: 'spell_holy_searinglight' },
  MANA_BURN: { id: 25380, name: 'Mana Burn', icon: 'spell_shadow_manaburn' },
  SHADOW_FIEND: { id: 34433, name: 'Shadow Fiend', icon: 'spell_shadow_shadowfiend' },

  PSYCHIC_SCREAM: { id: 10890, name: 'Psychic Scream', icon: 'spell_shadow_psychicscream' },
  DISPEL_MAGIC: { id: 988, name: 'Dispel Magic', icon: 'spell_holy_dispelmagic' },
  MASS_DISPEL: { id: 32375, name: 'Mass Dispel', icon: 'spell_arcane_massdispel' },
  SHACKLE_UNDEAD: { id: 10955, name: 'Shackle Undead', icon: 'spell_nature_slow' },
  MIND_SOOTHE: { id: 25596, name: 'Mind Soothe', icon: 'spell_holy_mindsooth' },
  MIND_CONTROL: { id: 10912, name: 'Mind Control', icon: 'spell_shadow_shadowworddominate' },
  MIND_VISION: { id: 10909, name: 'Mind Vision', icon: 'spell_holy_mindvision' },
  LEVITATE: { id: 1706, name: 'Levitate', icon: 'spell_holy_layonhands' },
  RESURRECTION: { id: 25435, name: 'Resurrection', icon: 'spell_holy_resurrection' },
  FADE: { id: 25429, name: 'Fade', icon: 'spell_magic_lesserinvisibilty' },

  POWER_WORD_FORTITUDE: {
    id: 25389,
    name: 'Power Word: Fortitude',
    icon: 'spell_holy_wordfortitude',
  },
  SHADOW_PROTECTION: { id: 25433, name: 'Shadow Protection', icon: 'spell_shadow_antishadow' },
  DIVINE_SPIRIT: { id: 25312, name: 'Divine Spirit', icon: 'spell_holy_divinespirit' },
  PRAYER_OF_FORTITUDE: {
    id: 25392,
    name: 'Prayer of Fortitude',
    icon: 'spell_holy_prayeroffortitude',
  },
  PRAYER_OF_SHADOW_PROTECTION: {
    id: 39374,
    name: 'Prayer of Shadow Protection',
    icon: 'spell_holy_prayerofshadowprotection',
  },
  PRAYER_OF_SPIRIT: { id: 32999, name: 'Prayer of Spirit', icon: 'spell_holy_prayerofspirit' },
  INNER_FIRE: { id: 25431, name: 'Inner Fire', icon: 'spell_holy_innerfire' },
  FEAR_WARD: { id: 6346, name: 'Fear Ward', icon: 'spell_holy_excorcism' },

  HOLY_NOVA: { id: 25331, name: 'Holy Nova', icon: 'spell_holy_holynova' },
  LIGHTWELL: { id: 28275, name: 'Lightwell', icon: 'spell_holy_summonlightwell' },
  CIRCLE_OF_HEALING: { id: 34866, name: 'Circle of Healing', icon: 'spell_holy_circleofrenewal' },

  INNER_FOCUS: { id: 14751, name: 'Inner Focus', icon: 'spell_frost_windwalkon' },
  POWER_INFUSION: { id: 10060, name: 'Power Infusion', icon: 'spell_holy_powerinfusion' },
  PAIN_SUPPRESSION: { id: 33206, name: 'Pain Suppression', icon: 'spell_holy_painsupression' },

  MIND_FLAY: { id: 25387, name: 'Mind Flay', icon: 'spell_shadow_siphonmana' },
  SILENCE: { id: 15487, name: 'Silence', icon: 'spell_shadow_impphaseshift' },
  VAMPIRIC_TOUCH: { id: 34917, name: 'Vampiric Touch', icon: '' },
  SHADOW_FORM: { id: 15473, name: 'Shaow Form', icon: 'spell_shadow_shadowform' },

  SYMBOL_OF_HOPE: { id: 32548, name: 'Symbol of Hope', icon: 'spell_holy_symbolofhope' },
  CHASTISE: { id: 44047, name: 'Chastise', icon: 'spell_holy_chastise' },
  DESPERATE_PRAYER: { id: 25437, name: 'Desperate Prayer', icon: 'spell_holy_restoration' },
  FEEDBACK: { id: 25441, name: 'Feedback', icon: 'spell_shadow_ritualofsacrifice' },
  STAR_SHARDS: { id: 25446, name: 'Star Shards', icon: 'spell_arcane_starfire' },
  ELUNES_GRACE: { id: 2651, name: 'Elunes Grace', icon: 'spell_holy_elunesgrace' },
  CONSUME_MAGIC: { id: 32676, name: 'Consume Magic', icon: 'spell_arcane_studentofmagic' },
  TOUCH_OF_WEAKNESS: { id: 25461, name: 'Touch of Weakness', icon: 'spell_shadow_deadofnight' },
  DEVOURING_PLAGUE: { id: 25467, name: 'Devouring Plague', icon: 'spell_shadow_blackplague' },
  SHADOW_GUARD: { id: 25477, name: 'Shadow Guard', icon: 'spell_nature_lightningshield' },
  HEX_OF_WEAKNESS: { id: 25470, name: 'Hex of Weakness', icon: 'spell_shadow_fingerofdeath' },
} as const;

export default spells;
