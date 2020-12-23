import { LegendarySpell, SpellList } from "common/SPELLS/Spell";

//BonusID:?

const legendaries: SpellList<LegendarySpell> = {
  //region Havoc
  CHAOS_THEORY: {
    id: 337551,
    name: 'Chaos Theory',
    icon: 'inv_glaive_1h_artifactaldrochi_d_03dual',
  },
  BURNING_WOUND: {
    id: 346279,
    name: 'Burning Wound',
    icon: 'spell_fire_felhellfire',
  }, 
  DARKER_NATURE: {
    id: 346264,
    name: 'Darker Nature',
    icon: 'ability_demonhunter_eyebeam',
  }, 
  ERRATIC_FEL_CORE: {
    id: 337685,
    name: 'Erratic Fel Core',
    icon: 'inv_archaeology_70_crystallineeyeofundravius',
  }, 
  //endregion

  //region Vengeance 
  FEL_FLAME_FORTIFICATION: {
    id: 337545,
    name: 'Fel Flame Fortification',
    icon: 'spell_fire_felfire',
  },
  FIERY_SOUL: {
    id: 337547,
    name: 'Fiery Soul',
    icon: 'inv__felbarrage',
  }, 
  RAZELIKHS_DEFILEMENT: {
    id: 337544,
    name: 'Razelikh\'s Defilement',
    icon: 'ability_demonhunter_concentratedsigils',
  }, 
  SPIRIT_OF_THE_DARKNESS_FLAME: {
    id: 337541,
    name: 'Spirit of the Darkness Flame',
    icon: 'inv_misc_head_dragon_blue_nightmare',
  }, 
  //endregion

  //region Shared
  COLLECTIVE_ANGUISH: {
    id: 337504,
    name: 'Collective Anguish',
    icon: 'artifactability_havocdemonhunter_anguishofthedeceiver',
  },
  DARKEST_HOUR: {
    id: 337539,
    name: 'Darkest Hour',
    icon: 'ability_demonhunter_darkness',
  }, 
  DARKGLARE_BOON: {
    id: 337534,
    name: 'Darkglare Boon',
    icon: 'inv_jewelry_necklace_53',
  }, 
  FEL_BOMBARDMENT: {
    id: 337775,
    name: 'Fel Bombardment',
    icon: 'inv_misc_head_dragon_blue_nightmare',
  }, 
  //endregion
} as const;
export default legendaries;
