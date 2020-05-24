import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const SurvivalChecklist = ({ combatant, castEfficiency, thresholds }: any) => {
  const AbilityRequirement = (props: any) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

  return (
    <Checklist>
      <Rule
        name="Use core abilities as often as possible"
        description={(
          <>
            Using your core abilities as often as possible can help raise your dps significantly. Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible, unless you need to save them for a prioirty burst phase that is coming up soon.
            {'  '}
            <a href="https://www.icy-veins.com/wow/survival-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a>
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.KILL_COMMAND_CAST_SV.id} />
        <AbilityRequirement spell={SPELLS.COORDINATED_ASSAULT.id} />

        {combatant.hasTalent(SPELLS.FLANKING_STRIKE_TALENT.id) && <AbilityRequirement spell={SPELLS.FLANKING_STRIKE_TALENT.id} />}
        {combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT.id) && <AbilityRequirement spell={SPELLS.A_MURDER_OF_CROWS_TALENT.id} />}
        {combatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id) ? <AbilityRequirement spell={SPELLS.WILDFIRE_INFUSION_TALENT.id} /> : <AbilityRequirement spell={SPELLS.WILDFIRE_BOMB.id} />}
        {combatant.hasTalent(SPELLS.CHAKRAMS_TALENT.id) && <AbilityRequirement spell={SPELLS.CHAKRAMS_TALENT.id} />}
      </Rule>

      {combatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id) ? (
        <Rule
          name="Mongoose Bite usage"
          description={(
            <>
              Using <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} /> properly is a key to achieving high dps. Maintaining high stacks of <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> buff from as soon as possible and casting as much <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} />s on max stacks as possible is considered to be most effective.
            </>
          )}
        >
          <Requirement name={<><ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink={false} /> Average focus on <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> opening window </>} thresholds={thresholds.mongooseBiteAverageFocusThreshold} />
          <Requirement name={<><SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} /> hits on max stacks of <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> </>} thresholds={thresholds.mongooseBite5StackHitPercentageThreshold} />
        </Rule>
      ) : null}

      <Rule
        name="Talent, cooldown and spell efficiency"
        description={(
          <>
            You want to be using your baseline spells as efficiently as possible, as well as choosing the right talents for the given scenario. If a talent isn't being used optimally for the encounter, you should consider swapping to a different talent.
          </>
        )}
      >
        {combatant.hasTalent(SPELLS.BIRDS_OF_PREY_TALENT.id) ? <Requirement name={<><SpellLink id={SPELLS.BIRDS_OF_PREY_TALENT.id} /> Effectiveness </>} thresholds={thresholds.birdPercentEffectiveness} /> : null}
      </Rule>
      <Rule
        name={<>Downtime & <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink={false} /> focus capping</>}
        description={(
          <>
            As a DPS, you should try to reduce the delay between casting spells, and stay off resource capping as much as possible. If everything is on cooldown, try and use {combatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id) ? <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} /> : <SpellLink id={SPELLS.RAPTOR_STRIKE.id} />} to stay off the focus cap and do some damage.
          </>
        )}
      >
        <Requirement name={<> Active time</>} thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

SurvivalChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default SurvivalChecklist;
