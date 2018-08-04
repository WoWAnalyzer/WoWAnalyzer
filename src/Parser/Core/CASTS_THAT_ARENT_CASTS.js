import SPELLS from 'common/SPELLS';

export default [
  /**This can consist of boss mechanics marked as casts, buff applications marked
   * as separate casts from the normal ability, toy casts that some people macro
   * into their abilities and so forth
   */
  SPELLS.ASTRAL_VULNERABILITY.id, // Tomb of Sargeras - Sisters of the Moon: the "tick" when someone crosses moons
  SPELLS.ANNIHILATION_TRILLIAX.id, // The Nighthold - cake boss: the "tick" of the Annihilation beam
  SPELLS.CHI_BURST_HEAL.id, // this is the "tick" when you hit a player, the actual cast has a different id
  SPELLS.EONARS_COMPASSION_HEAL.id, // this is the "tick" when you hit a player, the actual cast has a different id
  SPELLS.SHADOWY_APPARITION.id,
  SPELLS.GOLGANNETHS_VITALITY_RAVAGING_STORM.id, // this is the "tick" when hitting with ravaging storm from Gol'ganneths Vitality
  SPELLS.GOLGANNETHS_VITALITY_THUNDEROUS_WRATH.id, // this is the empowered proc from Gol'ganneths Vitality
  SPELLS.DEFILED_AUGMENT_RUNE.id,
  SPELLS.UMBRAL_GLAIVE_STORM_TICK.id, // ticks of the Umbral Moonglaives trinket proc a cast event
  SPELLS.PRIMAL_FURY.id, // Feral Druid "extra CP on crit" proc causes a cast event
  SPELLS.BARBED_SHOT_PET_BUFF.id, //The buff applied to BM Hunter pet when casting Barbed Shot
  SPELLS.BLOW_DARKMOON_WHISTLE.id, //Darkmoon Whistle active that some people macro into abilities
  SPELLS.DARKMOON_FIREWORK.id, //Darkmoon Firework toy
  SPELLS.FIRE_MINES.id, // Forgefiends fabricator
  SPELLS.FIRE_MINES_2.id, // Forgefiends fabricator
  SPELLS.BIG_RED_RAYS.id, //Big Red Raygun active effect
];
