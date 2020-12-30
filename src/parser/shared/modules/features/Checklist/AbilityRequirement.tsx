import React from 'react';

import CastEfficiency from '../../CastEfficiency';
import GenericCastEfficiencyRequirement from './GenericCastEfficiencyRequirement';

type Props = {
  castEfficiency: CastEfficiency;
  spell: number;
};

const AbilityRequirement = ({ castEfficiency, spell, ...others }: Props) => {
  const abilityCastEfficiency = castEfficiency.getCastEfficiencyForSpellId(spell);
  return (
    abilityCastEfficiency && (
      <GenericCastEfficiencyRequirement
        castEfficiency={abilityCastEfficiency}
        spell={spell}
        {...others}
      />
    )
  );
};

export default AbilityRequirement;
