import { LegendarySpell, SpellList } from "common/SPELLS/Spell";

const legendaries: SpellList<LegendarySpell> = {
  //region Havoc
  CHAOS_THEORY: {
    id: 337551,
    name: 'Chaos Theory',
    icon: 'inv_glaive_1h_artifactaldrochi_d_03dual',
    bonusID: 7050,
  },
  CHAOTIC_BLADES: { //Buff from Chaos Theory legendary
    id: 337567,
    name: 'Chaotic Blades',
    icon: 'inv_glaive_1h_artifactaldrochi_d_03dual',
  },
  BURNING_WOUND: {
    id: 346279,
    name: 'Burning Wound',
    icon: 'spell_fire_felhellfire',
    bonusID: 7219,
  }, 
  DARKER_NATURE: {
    id: 346264,
    name: 'Darker Nature',
    icon: 'ability_demonhunter_eyebeam',
    bonusID: 7218,
  }, 
  ERRATIC_FEL_CORE: {
    id: 337685,
    name: 'Erratic Fel Core',
    icon: 'inv_archaeology_70_crystallineeyeofundravius',
    bonusID: 7051,
  }, 
  //endregion

  //region Vengeance 
  FEL_FLAME_FORTIFICATION: {
    id: 337545,
    name: 'Fel Flame Fortification',
    icon: 'spell_fire_felfire',
    bonusID: 7047,
  },
  FIERY_SOUL: {
    id: 337547,
    name: 'Fiery Soul',
    icon: 'inv__felbarrage',
    bonusID: 7048,
  }, 
  RAZELIKHS_DEFILEMENT: {
    id: 337544,
    name: 'Razelikh\'s Defilement',
    icon: 'ability_demonhunter_concentratedsigils',
    bonusID: 7046,
  }, 
  SPIRIT_OF_THE_DARKNESS_FLAME: {
    id: 337541,
    name: 'Spirit of the Darkness Flame',
    icon: 'inv_misc_head_dragon_blue_nightmare',
    bonusID: 7045,
  }, 
  //endregion

  //region Shared
  COLLECTIVE_ANGUISH: {
    id: 337504,
    name: 'Collective Anguish',
    icon: 'artifactability_havocdemonhunter_anguishofthedeceiver',
    bonusID: 7041,
  },
  FEL_DEVESTATION_DAMAGE: { //The damage spell that the demon is doing from Collective Anguish legendary
    id: 346503,
    name: 'Fel Devestation',
    icon: 'ability_demonhunter_feldevastation',
  },
  DARKEST_HOUR: {
    id: 337539,
    name: 'Darkest Hour',
    icon: 'ability_demonhunter_darkness',
    bonusID: 7044,
  }, 
  DARKGLARE_BOON: {
    id: 337534,
    name: 'Darkglare Boon',
    icon: 'inv_jewelry_necklace_53',
    bonusID: 7043,
  }, 
  FEL_BOMBARDMENT: {
    id: 337775,
    name: 'Fel Bombardment',
    icon: 'inv_misc_head_dragon_blue_nightmare',
    bonusID: 7052,
  }, 
  //endregion
} as const;
export default legendaries;
