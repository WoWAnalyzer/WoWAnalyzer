import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'Parser/Core/Modules/Features/Checklist2';
import Rule from 'Parser/Core/Modules/Features/Checklist2/Rule';
import Requirement from 'Parser/Core/Modules/Features/Checklist2/Requirement';
import PreparationRule from 'Parser/Core/Modules/Features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'Parser/Core/Modules/Features/Checklist2/GenericCastEfficiencyRequirement';

class ProtectionPaladinChecklist extends React.PureComponent{
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
  };

  render(){
    const {combatant, castEfficiency, thresholds} = this.props;

    const AbilityRequirement = props => (
      <GenericCastEfficiencyRequirement
        castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
        {...props}
      />
    );

    return (
      <Checklist>
        <Rule
          name={"Use core abilities as often as possible."}
          description={"These should generally always be recharging to maximize efficiency."}
        >
          <AbilityRequirement spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} />
          <AbilityRequirement spell={SPELLS.AVENGERS_SHIELD.id} />
          <AbilityRequirement spell={SPELLS.JUDGMENT_CAST_PROTECTION.id} />
          {combatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id) && <AbilityRequirement spell={SPELLS.BLESSED_HAMMER_TALENT.id} />}
          {!combatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id) && <AbilityRequirement spell={SPELLS.HAMMER_OF_THE_RIGHTEOUS.id} />}
        </Rule>

        <Rule
          name={(
            <React.Fragment>
              Mitigate incoming damage with <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> and <SpellLink id={SPELLS.CONSECRATION_CAST.id} />
            </React.Fragment>
          )}
          description={(
            <React.Fragment>
              Maintain <SpellLink id={SPELLS.CONSECRATION_CAST.id} /> to reduce all incoming damage by a flat amount and use it as a rotational filler if necessary.<br />
              Use <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> to flat out your physical damage taken or weave them into your rotation when you're about to cap charges.
            </React.Fragment>
          )}
        >
          <Requirement
            name={(
              <React.Fragment><SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> efficiency</React.Fragment>
            )}
            thresholds={thresholds.shieldOfTheRighteous}
          />
          <Requirement
            name={(
              <React.Fragment><SpellLink id={SPELLS.CONSECRATION_CAST.id} /> uptime</React.Fragment>
            )}
            thresholds={thresholds.consecration}
          />
        </Rule>

        <Rule
          name="Use your defensive cooldowns."
          description="Use these to smooth incoming damage and mitigate spikes as well as reduce external healing required."
        >
          <AbilityRequirement spell={SPELLS.ARDENT_DEFENDER.id} />
          <AbilityRequirement spell={SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id} />
          {combatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id) && <AbilityRequirement spell={SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id} />}
          {!combatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id) && <AbilityRequirement spell={SPELLS.LIGHT_OF_THE_PROTECTOR.id} />}
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default ProtectionPaladinChecklist;
