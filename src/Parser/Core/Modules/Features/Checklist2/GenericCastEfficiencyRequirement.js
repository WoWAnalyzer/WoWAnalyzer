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
  static propTypes = {
    spell: PropTypes.number.isRequired,
    castEfficiency: PropTypes.shape({
      efficiency: PropTypes.number.isRequired,
      gotMaxCasts: PropTypes.bool.isRequired,
      recommendedEfficiency: PropTypes.number.isRequired,
      averageIssueEfficiency: PropTypes.number.isRequired,
      majorIssueEfficiency: PropTypes.number.isRequired,
    }).isRequired,
  };

  get thresholds() {
    if (!this.props.castEfficiency) {
      throw new Error(`GenericCastEfficiencyRequirement requires that you pass the castEfficiency object yourself. Spell: ${this.props.spell}`);
    }
    const {
      efficiency,
      gotMaxCasts,
      recommendedEfficiency: minor,
      averageIssueEfficiency: average,
      majorIssueEfficiency: major,
    } = this.props.castEfficiency;

    return {
      actual: gotMaxCasts ? 1 : efficiency,
      isLessThan: {
        minor,
        average,
        major,
      },
      style: 'percentage',
    };
  }

  render() {
    const { spell, ...others } = this.props;

    return (
      <Requirement
        name={<SpellLink id={spell} />}
        thresholds={this.thresholds}
        {...others}
      />
    );
  }
}

export default GenericCastEfficiencyRequirement;
