import React from 'react';

import SpellLink from 'common/SpellLink';

import Requirement from '../Requirement';

class GenericCastEfficiencyRequirement extends Requirement {
  constructor({ spell, ...others }) {
    super({
      name: <SpellLink id={spell.id} />,
      check: function () { // don't use arrow function or `this` won't be set properly
        // The `this` of this function refers to the Checklist instance, not the requirement.
        if (!this.castEfficiency) {
          throw new Error('The CastEfficiency module needs to be a dependency of the checklist to use the GenericCastEfficiencyRequirement.');
        }
        const {
          efficiency,
          gotMaxCasts,
          recommendedEfficiency: minor,
          averageIssueEfficiency: average,
          majorIssueEfficiency: major,
        } = this.castEfficiency.getCastEfficiencyForSpellId(spell.id);

        return {
          actual: gotMaxCasts ? 1 : efficiency,
          isLessThan: {
            minor,
            average,
            major,
          },
          style: 'percentage',
        };
      },
      when: function () { // don't use arrow function or `this` won't be set properly
        // The `this` of this function refers to the Checklist instance, not the requirement.
        if (!this.abilities) {
          throw new Error('The Abilities module needs to be a dependency of the checklist to use the GenericCastEfficiencyRequirement.');
        }
        // So that implementers don't have to duplicate logic, this requirement is only active (by default, this can be overriden by providing this property yourself) when the cast efficiency suggestion is active.
        return !!this.abilities.getAbility(spell.id);
      },
      ...others,
    });
  }
}

export default GenericCastEfficiencyRequirement;
