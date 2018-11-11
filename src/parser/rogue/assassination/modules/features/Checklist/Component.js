import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import Requirement from 'parser/shared/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class AssassinationRogueChecklist extends React.PureComponent {
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
  };

  render() {
    const { combatant, castEfficiency, thresholds } = this.props;

    const AbilityRequirement = props => (
      <GenericCastEfficiencyRequirement
        castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
        {...props}
      />
    );

    return (
      <Checklist>
        <Rule
          name="Maintain your DoTs on the boss"
          description="DoTs are a big part of your damage. You should try to keep as high uptime on them as possible."
        >
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.GARROTE.id} /> uptime
              </>
            )}
            thresholds={thresholds.garroteUptime}
          />
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.RUPTURE.id} /> uptime
              </>
            )}
            thresholds={thresholds.ruptureUptime}
          />
        </Rule>
        <Rule
          name="Do not overcap your resources"
          description="You should try to always avoid overcapping your Energy and Combo Points."
        >
          <Requirement name="Energy efficiency" thresholds={thresholds.energyEfficiency} />
          <Requirement name="Combo Point efficiency" thresholds={thresholds.comboPointEfficiency} />
          {combatant.hasTalent(SPELLS.BLINDSIDE_TALENT.id) && (
            <Requirement
              name={(
                <>
                  <SpellLink id={SPELLS.BLINDSIDE_TALENT.id} /> efficiency
                </>
              )}
              thresholds={thresholds.blindsideEfficiency}
            />
          )}
        </Rule>
        <Rule
          name="Use your cooldowns"
          description="Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming soon. Holding cooldowns too long will hurt your DPS."
        >
          <AbilityRequirement spell={SPELLS.VENDETTA.id} />
          <AbilityRequirement spell={SPELLS.VANISH.id} />
          {combatant.hasTalent(SPELLS.EXSANGUINATE_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.EXSANGUINATE_TALENT.id} />
          )}
          {combatant.hasTalent(SPELLS.TOXIC_BLADE_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.TOXIC_BLADE_TALENT.id} />
          )}
          {combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.MARKED_FOR_DEATH_TALENT.id} />
          )}
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default AssassinationRogueChecklist;
