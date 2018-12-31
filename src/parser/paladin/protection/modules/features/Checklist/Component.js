import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import Requirement from 'parser/shared/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class ProtectionPaladinChecklist extends React.PureComponent{
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
    extras: PropTypes.object.isRequired,
  };

  render(){
    const {castEfficiency, thresholds} = this.props;

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
          <Requirement
            name={<>Bad <SpellLink id={this.props.extras.hotrAbility.id} /> casts</>}
            tooltip="This is a <em>filler</em> ability and should only be cast while your other spells are on cooldown."
            thresholds={thresholds.hotrBadCasts}
          />
        </Rule>

        <Rule
          name={(
            <>
              Mitigate incoming damage with <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> and <SpellLink id={SPELLS.CONSECRATION_CAST.id} />
            </>
          )}
          description={(
            <>
              Maintain <SpellLink id={SPELLS.CONSECRATION_CAST.id} /> to reduce all incoming damage by a flat amount and use it as a rotational filler if necessary.<br />
              Use <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> to smooth out your physical damage taken or weave them into your rotation when you're about to cap charges. <SpellLink id={SPELLS.ARDENT_DEFENDER.id} /> can be used either as a cooldown to mitigate boss abilities or to cover time when <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> is unavailable.
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id}
            name={(<><SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> cast efficiency</>)} 
          />
          <Requirement
            name={(
              <>Good <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> casts</>
            )}
            thresholds={thresholds.shieldOfTheRighteous}
          />
          <Requirement
            name={(
              <>Hits Mitigated with <SpellLink id={SPELLS.CONSECRATION_CAST.id} /></>
            )}
            thresholds={thresholds.consecration}
          />
          <AbilityRequirement spell={SPELLS.ARDENT_DEFENDER.id} 
            name={(<><SpellLink id={SPELLS.ARDENT_DEFENDER.id} /> cast efficiency</>)} 
          />
        </Rule>
        <Rule 
          name={<>Use <SpellLink id={this.props.extras.lotpAbility.id} /> to heal yourself</>}
          description={( 
            <>
            Using <SpellLink id={this.props.extras.lotpAbility.id} /> to heal yourself is critical to tanking effectively. You should aim to cast it as much as possible without overhealing. It is also important to avoid delaying the cast because this may result in "sniping" a healer's cast, causing it to overheal and wasting resources.
            </> 
          )}
        >
          <AbilityRequirement name={<><SpellLink id={this.props.extras.lotpAbility.id} /> Cast Efficiency</>} 
            spell={this.props.extras.lotpAbility.id} />
          <Requirement name="Avg. Cast Delay" thresholds={thresholds.lotpDelay} />
          <Requirement name="Overhealing" thresholds={thresholds.lotpOverheal} />
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default ProtectionPaladinChecklist;
