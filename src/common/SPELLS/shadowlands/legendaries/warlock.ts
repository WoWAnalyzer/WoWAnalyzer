import { SpellList, LegendarySpell } from "common/SPELLS/Spell";

const legendaries: SpellList<LegendarySpell> = {
  //Shared
  CLAW_OF_ENDERETH: {
    id: 337038,
    name: 'Claw of Endereth',
    icon: 'inv_flaming_splinter',
    bonusID: 7026,
  },
  MARK_OF_BORROWED_POWER: {
    id: 337057,
    name: 'Mark of Borrowed Power',
    icon: 'spell_shadow_rune',
    bonusID: 7027,
  },
  PILLARS_OF_THE_DARK_PORTAL: {
    id: 337065,
    name: 'Pillars of the Dark Portal',
    icon: 'spell_warlock_demonicportal_green',
    bonusID: 7028,
  },
  WILFREDS_SIGIL_OF_SUPERIOR_SUMMONING: {
    id: 337020,
    name: 'Wilfred\'s Sigil of Superior Summoning',
    icon: 'spell_warlock_demonicportal_purple',
    bonusID: 7025,
  },

  //Affliction
  MALEFIC_WRATH: {
    id: 337122,
    name: 'Malefic Wrath',
    icon: 'spell_shadow_soulleech_3',
    bonusID: 7031,
  },
  PERPETUAL_AGONY_OF_AZJAQIR: {
    id: 337106,
    name: 'Perpetual Agony of Azj\'Aqir',
    icon: 'spell_shadow_painandsuffering',
    bonusID: 7029,
  },
  SACROLASHS_DARK_STRIDE: {
    id: 337111,
    name: 'Sacrolash\'s Dark Stride',
    icon: 'spell_nzinsanity_fearofdeath',
    bonusID: 7030,
  },
  WRATH_OF_CONSUMPTION: {
    id: 337128,
    name: 'Wrath of Consumption',
    icon: 'spell_nature_drowsy',
    bonusID: 7032,
  },

  //Demonology
  IMPLOSIVE_POTENTIAL: {
    id: 337135,
    name: 'Implosive Potential',
    icon: 'spell_warlock_summonimpoutland',
    bonusID: 7033,
  },
  GRIM_INQUISITORS_DREAD_CALLING: {
    id: 337141,
    name: 'Grim Inquisitor\'s Dread Calling',
    icon: 'spell_warlock_calldreadstalkers',
    bonusID: 7034,
  },
  FORCES_OF_THE_HORNED_NIGHTMARE: {
    id: 337146,
    name: 'Forces of the Horned Nightmare',
    icon: 'ability_warlock_handofguldan',
    bonusID: 7035,
  },
  BALESPIDERS_BURNING_CORE: {
    id: 337159,
    name: 'Balespider\'s Burning Core',
    icon: 'inv_trinket_firelands_02',
    bonusID: 7036,
  },

  //Destruction
  CINDERS_OF_THE_AZJAQIR: {
    id: 337166,
    name: 'Cinders of the Azj\'Aqir',
    icon: 'spell_fire_fireball',
    bonusID: 7038,
  },
  EMBERS_OF_THE_DIABOLIC_RAIMENT: {
    id: 337272,
    name: 'Embers of the Diabolic Raiment',
    icon: 'inv_shoulder_robe_raidmage_j_01',
    bonusID: 7040,
  },
  MADNESS_OF_THE_AZJAQIR: {
    id: 337169,
    name: 'Madness of the Azj\'Aqir',
    icon: 'ability_warlock_chaosbolt',
    bonusID: 7039,
  },
  ODR_SHAWL_OF_THE_YMIRJAR: {
    id: 337163,
    name: 'Odr, Shawl of the Ymirjar',
    icon: 'inv_cape_pandariapvp_d_01',
    bonusID: 7037,
  },
};
export default legendaries;
