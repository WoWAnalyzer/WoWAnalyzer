import SPELLS from 'common/SPELLS';

export default [
  // Boss mechanics marked as casts
  SPELLS.ASTRAL_VULNERABILITY.id, // the "tick" when someone crosses moons
  SPELLS.ANNIHILATION_TRILLIAX.id, // the "tick" of the Annihilation beam
  SPELLS.CHI_BURST_HEAL.id, // this is the "tick" when you hit a player, the actual cast has a different id
  SPELLS.EONARS_COMPASSION_HEAL.id, // this is the "tick" when you hit a player, the actual cast has a different id
];
