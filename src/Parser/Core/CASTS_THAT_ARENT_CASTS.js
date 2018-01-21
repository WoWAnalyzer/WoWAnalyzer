import SPELLS from 'common/SPELLS';

export default [
  // Boss mechanics marked as casts
  SPELLS.ASTRAL_VULNERABILITY.id, // the "tick" when someone crosses moons
  SPELLS.ANNIHILATION_TRILLIAX.id, // the "tick" of the Annihilation beam
  SPELLS.CHI_BURST_HEAL.id, // this is the "tick" when you hit a player, the actual cast has a different id
  SPELLS.EONARS_COMPASSION_HEAL.id, // this is the "tick" when you hit a player, the actual cast has a different id
  147193, // Shadowy Apparition - the tick of Shadow Word: Pain damage crits for Shadow Priests
  SPELLS.GOLGANNETHS_VITALITY_RAVAGING_STORM.id, // this is the "tick" when hitting with ravaging storm from Gol'ganneths Vitality
  SPELLS.GOLGANNETHS_VITALITY_THUNDEROUS_WRATH.id, // this is the empowered proc from Gol'ganneths Vitality
  224001, // Defiled Augment Rune cast
];
