import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import { captureException } from 'common/errorLogger';

import Requirement from './Requirement';

/**
 * This is a common requirement for all checklists that uses settings for CastEfficiency to create a Requirement. It shows the spell and your efficiency as performance depending on the configured cast efficiency efficiency thresholds.
 *
 * This requirement is automatically disabled if the ability's CastEfficiency suggestion is disabled (i.e. if the ability's castEfficiency: { suggestion } is unset or false), or the ability is disabled completely. If you set `onlyWithSuggestion` to `false` in the object when creating this requirement you can change this behavior to always show if the ability is enabled, regardless of the CastEfficiency suggestion property being set.
 */
class GenericMaxCastEfficiencyRequirement extends React.PureComponent {
  static propTypes = {
    spell: PropTypes.number.isRequired,
    name: PropTypes.node,
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
      captureException(new Error(`GenericMaxCastEfficiencyRequirement requires that you pass the castEfficiency object yourself. Spell: ${this.props.spell}`));
      return null;
    }
    const {
      casts,
      maxCasts,
    } = this.props.castEfficiency;

    return {
      actual: casts,
      max: maxCasts,
      isLessThan: {
        minor: maxCasts,
        average: maxCasts - 1,
        major: maxCasts - 2,
      },
      style: 'number',
    };
  }

  render() {
    const { spell, name, ...others } = this.props;

    const thresholds = this.thresholds;
    if (!thresholds) {
      return null;
    }

    console.log(thresholds);

    return (
      <Requirement
        name={name || <SpellLink id={spell} />}
        thresholds={thresholds}
        {...others}
      />
    );
  }
}

export default GenericMaxCastEfficiencyRequirement;
