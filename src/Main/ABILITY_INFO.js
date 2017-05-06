import talents from './ABILITY_INFO_TALENTS';

const ABILITY_INFO = {
  ...talents,
};

// For ease of use we want to both be able to access abilities by code names (e.g. `ABILITY_INFO.AURA_OF_MERCY_TALENT`) and by spell id (e.g. `ABILITY_INFO[183415]`)
Object.keys(ABILITY_INFO).forEach((key) => {
  const ability = ABILITY_INFO[key];

  ABILITY_INFO[ability.id] = ability;
});

export default ABILITY_INFO;
