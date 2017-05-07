import talents from './SPELLS_TALENTS';
import spells from './SPELLS_ABILITIES';
import traits from './SPELLS_TRAITS';

const ABILITIES = {
  ...talents,
  ...spells,
  ...traits,
};

// For ease of use we want to both be able to access abilities by code names (e.g. `ABILITIES.AURA_OF_MERCY_TALENT`) and by spell id (e.g. `ABILITIES[183415]`)
Object.keys(ABILITIES).forEach((key) => {
  const ability = ABILITIES[key];

  ABILITIES[ability.id] = ability;
});

export default ABILITIES;
