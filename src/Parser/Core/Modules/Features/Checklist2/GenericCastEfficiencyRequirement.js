import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';

import Requirement from './Requirement';

/**
 * This is a common requirement for all checklists that uses settings for CastEfficiency to create a Requirement. It shows the spell and your efficiency as performance depending on the configured cast efficiency efficiency thresholds.
 *
 * This requirement is automatically disabled if the ability's CastEfficiency suggestion is disabled (i.e. if the ability's castEfficiency: { suggestion } is unset or false), or the ability is disabled completely. If you set `onlyWithSuggestion` to `false` in the object when creating this requirement you can change this behavior to always show if the ability is enabled, regardless of the CastEfficiency suggestion property being set.
 */
class GenericCastEfficiencyRequirement extends React.PureComponent {
  render() {
    return 'NYI';
  }
  // static propTypes = {
  //   spell: PropTypes.number.isRequired,
  //   abilities: PropTypes.shape({
  //     getAbility: PropTypes.func.isRequired,
  //   }).isRequired,
  //   onlyWithSuggestion: PropTypes.bool,
  // };
  // static defaultProps = {
  //   onlyWithSuggestion: true,
  // };
  //
  // get active() {
  //   // By default this requirement is only active when the cast efficiency suggestion is active. This is so implementers don't have to duplicate logic. This can be overriden by providing the `when` property yourself.
  //   const ability = this.props.abilities.getAbility(this.props.spell);
  //   if (this.props.onlyWithSuggestion) {
  //     // This is the default: only show the requirement if this spell's cast efficiency suggestion would be active
  //     return ability && ability.castEfficiency && ability.castEfficiency.suggestion;
  //   } else {
  //     return !!ability;
  //   }
  // }
  // get thresholds() {
  //   if (!this.castEfficiency) {
  //     throw new Error('The CastEfficiency module needs to be a dependency of the checklist to use the GenericCastEfficiencyRequirement.');
  //   }
  //   const {
  //     efficiency,
  //     gotMaxCasts,
  //     recommendedEfficiency: minor,
  //     averageIssueEfficiency: average,
  //     majorIssueEfficiency: major,
  //   } = this.castEfficiency.getCastEfficiencyForSpellId(spell.id);
  //
  //   return {
  //     actual: gotMaxCasts ? 1 : efficiency,
  //     isLessThan: {
  //       minor,
  //       average,
  //       major,
  //     },
  //     style: 'percentage',
  //   };
  // }
  //
  // render() {
  //   const { spell } = this.props;
  //
  //   if (!this.active) {
  //     return null;
  //   }
  //
  //   return (
  //     <Requirement
  //       name={<SpellLink id={spell} />}
  //     />
  //   );
  // }
}

export default GenericCastEfficiencyRequirement;
