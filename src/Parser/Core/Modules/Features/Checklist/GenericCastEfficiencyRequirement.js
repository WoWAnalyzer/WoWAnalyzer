import React from 'react';

import SpellLink from 'common/SpellLink';

import Requirement from './Requirement';

class GenericCastEfficiencyRequirement extends Requirement {
  constructor({ spell, ...others }) {
    super({
      name: <SpellLink id={spell.id} icon />,
      check: function () {
        if (!this.castEfficiency) {
          throw new Error('The CastEfficiency module needs to be a dependency of the checklist to use the GenericCastEfficiencyRequirement.');
        }
        const castEfficiency = this.castEfficiency.getCastEfficiencyForSpellId(spell.id);
        if (!castEfficiency) {
          throw new Error(`Spell not active: ${spell.id} ${spell.name}`);
        }
        const {
          efficiency,
          recommendedEfficiency: minor,
          averageIssueEfficiency: average,
          majorIssueEfficiency: major,
        } = castEfficiency;

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
