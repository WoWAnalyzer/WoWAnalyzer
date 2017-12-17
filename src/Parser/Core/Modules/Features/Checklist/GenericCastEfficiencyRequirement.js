import React from 'react';

import SpellLink from 'common/SpellLink';

import Requirement from './Requirement';

class GenericCastEfficiencyRequirement extends Requirement {
  constructor({ spell, ...others }) {
    super({
      name: <SpellLink id={spell.id} icon />,
      check: function () {
        const {
          efficiency,
          recommendedEfficiency: minor,
          averageIssueEfficiency: average,
          majorIssueEfficiency: major,
        } = this.castEfficiency.getCastEfficiencyForSpellId(spell.id);

        return {
          actual: efficiency,
          isLessThan: {
            minor,
            average,
            major,
          },
          style: 'percentage',
        };
      },
      ...others,
    });
  }
}

export default GenericCastEfficiencyRequirement;
