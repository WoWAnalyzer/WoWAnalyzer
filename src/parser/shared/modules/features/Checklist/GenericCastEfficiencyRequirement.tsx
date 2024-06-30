import { SpellLink } from 'interface';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { AbilityCastEfficiency } from 'parser/shared/modules/CastEfficiency';
import { PureComponent } from 'react';
import Spell from 'common/SPELLS/Spell';

import Requirement, { RequirementThresholds } from './Requirement';

interface Props {
  name?: string | JSX.Element;
  spell: number | Spell;
  castEfficiency: AbilityCastEfficiency | null;
  casts?: number;
  isMaxCasts?: boolean;
}

/**
 * This is a common requirement for all checklists that uses settings for CastEfficiency to create a Requirement. It shows the spell and your efficiency as performance depending on the configured cast efficiency efficiency thresholds.
 *
 * This requirement is automatically disabled if the ability's CastEfficiency suggestion is disabled (i.e. if the ability's castEfficiency: { suggestion } is unset or false), or the ability is disabled completely. If you set `onlyWithSuggestion` to `false` in the object when creating this requirement you can change this behavior to always show if the ability is enabled, regardless of the CastEfficiency suggestion property being set.
 */
class GenericCastEfficiencyRequirement extends PureComponent<Props> {
  get thresholds(): RequirementThresholds | null {
    if (!this.props.castEfficiency) {
      return null;
    }

    if (this.props.isMaxCasts) {
      const { casts, maxCasts } = this.props.castEfficiency;

      return {
        actual: casts,
        max: maxCasts,
        isLessThan: {
          minor: maxCasts,
          average: maxCasts - 1,
          major: maxCasts - 2,
        },
        style: ThresholdStyle.NUMBER,
      };
    } else {
      const {
        efficiency,
        gotMaxCasts,
        recommendedEfficiency: minor,
        averageIssueEfficiency: average,
        majorIssueEfficiency: major,
      } = this.props.castEfficiency;

      return {
        actual: Number(gotMaxCasts ? 1 : efficiency),
        isLessThan: {
          minor,
          average,
          major,
        },
        style: ThresholdStyle.PERCENTAGE,
      };
    }
  }

  render() {
    const { spell, name, ...others } = this.props;

    const thresholds = this.thresholds;
    if (!thresholds) {
      return null;
    }

    return (
      <Requirement name={name || <SpellLink spell={spell} />} thresholds={thresholds} {...others} />
    );
  }
}

export default GenericCastEfficiencyRequirement;
