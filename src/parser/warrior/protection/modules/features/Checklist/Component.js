import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ResourceLink from 'common/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

class ProtectionWarriorChecklist extends React.PureComponent {
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
          name="Rotational Spells"
          description={(
            <>
              As a protection warrior you want to maximize your rage generation which can be done by casting these spells as frequent as possible.
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.THUNDER_CLAP.id} />
          <AbilityRequirement spell={SPELLS.SHIELD_SLAM.id} />
          {combatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id) && <AbilityRequirement spell={SPELLS.DEMORALIZING_SHOUT.id} />}
          {combatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id) && <AbilityRequirement spell={SPELLS.DRAGON_ROAR_TALENT.id} />}
        </Rule>

        {this.rulesForShortCD()}

        <Rule
          name="Defensive Cooldowns"
          description={(
            <>
              As a protection warrior you have many options to mitigate damage and should be using all of them. Take <SpellLink id={SPELLS.SPELL_REFLECTION.id} /> with a grain a salt as some bosses it is not as helpful on as others. 
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.SHIELD_WALL.id} />
          <AbilityRequirement spell={SPELLS.LAST_STAND.id} />
          <AbilityRequirement spell={SPELLS.SPELL_REFLECTION.id} /> 
          {!combatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id) && <AbilityRequirement spell={SPELLS.DEMORALIZING_SHOUT.id} />}
        </Rule>

        <Rule
          name="Offensive Cooldowns"
          description={(
            <>
              As a protection warrior you have a few cooldowns you can use to maximize your damage which you should be using aggresively.
            </>
          )}
          >
            <AbilityRequirement spell={SPELLS.AVATAR_TALENT.id} />
            {combatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id) && <AbilityRequirement spell={SPELLS.DEMORALIZING_SHOUT.id} />}
            {combatant.hasTalent(SPELLS.RAVAGER_TALENT_PROTECTION.id) && <AbilityRequirement spell={SPELLS.RAVAGER_TALENT_PROTECTION.id} />}
          </Rule>

        <Rule
          name="Don't get too angry"
          description={(
            <>
              Try to not waste <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> by generating more when you are already at max.
            </>
          )}
        >
          <Requirement name="Lost Rage" thresholds={thresholds.rageDetails} />
        </Rule>

        <Rule
          name="Utility"
          description={(
            <>
              As a protection warrior you have many spells that provide utility to the raid. You should use these when you need to
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.RALLYING_CRY.id} />
          <AbilityRequirement spell={SPELLS.INTERCEPT.id} />
        </Rule>
            
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default ProtectionWarriorChecklist;
