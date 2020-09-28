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

const ProtectionWarriorChecklist = ({ combatant, castEfficiency, thresholds }) => {
  const AbilityRequirement = props => (
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
        name="Rotational Spells"
        description={(
          <>
            Be sure to use <SpellLink id={SPELLS.SHIELD_SLAM.id} /> and <SpellLink id={SPELLS.THUNDER_CLAP.id} /> on cooldown to maximise your <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> generation and damage output.<br /> <SpellLink id={SPELLS.REVENGE.id} /> can be used to avoid rage capping and <SpellLink id={SPELLS.DEVASTATE.id} /> should only be used when every other spell mentioned here is on cooldown.
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.THUNDER_CLAP.id} />
        <Requirement
          name={(<SpellLink id={SPELLS.SHIELD_SLAM.id} /> )}
          thresholds={thresholds.shieldSlam}
        />
        <AbilityRequirement spell={SPELLS.SHIELD_BLOCK.id} />
        <Requirement
          name={(<>Effective <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> Casts </>)}
          thresholds={thresholds.shieldBlock}
          />
        {combatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id) && (
          <Requirement
            name={(<SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> )}
            thresholds={thresholds.demoShoutCD}
          />
        )}
        {combatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id) && <AbilityRequirement spell={SPELLS.DRAGON_ROAR_TALENT.id} />}

      </Rule>

      <Rule
        name="Defensive Cooldowns"
        description={(
          <>
           Protection warriors have a multitude of defensive spells on a fairly short cooldown.  Be sure to use these to further mitigate incoming damage.
          </>
        )}
      >
        <Requirement
          name={(<SpellLink id={SPELLS.SHIELD_WALL.id} /> )}
          thresholds={thresholds.shieldWallCD}
          />
        <Requirement
          name={(<SpellLink id={SPELLS.LAST_STAND.id} /> )}
          thresholds={thresholds.lastStandCD}
          />
        <Requirement
          name={(<>Magic damage with <SpellLink id={SPELLS.SPELL_REFLECTION.id} /></> )}
          thresholds={thresholds.spellReflect}
          />
        {!combatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id) && (
            <Requirement
              name={(<SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> )}
              thresholds={thresholds.demoShoutCD}
          />
          )}
      </Rule>

      <Rule
        name="Offensive Cooldowns"
        description={(
          <>
            Using <SpellLink id={SPELLS.AVATAR_TALENT.id} /> as often as possible is very important because it will increase your overall damage a lot and provides 20 <ResourceLink id={RESOURCE_TYPES.RAGE.id} />.<br /> If you are also using <SpellLink id={SPELLS.UNSTOPPABLE_FORCE_TALENT.id} /> remember that <SpellLink id={SPELLS.THUNDER_CLAP.id} /> will have a reduced cooldown so you can use it every other GCD.

          </>
        )}
        >
          <Requirement
            name={(<SpellLink id={SPELLS.AVATAR_TALENT.id} /> )}
            thresholds={thresholds.avatarCD}
          />
          {combatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id) && (
            <Requirement
              name={(<SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> )}
              thresholds={thresholds.demoShoutCD}
          />
          )}
          {combatant.hasTalent(SPELLS.RAVAGER_TALENT_PROTECTION.id) && <AbilityRequirement spell={SPELLS.RAVAGER_TALENT_PROTECTION.id} />}

        </Rule>

      <Rule
        name="Don't get too angry"
        description={(
          <>
            Minimizing your wasted <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> should be top priority as a protection warrior so be sure to use <SpellLink id={SPELLS.IGNORE_PAIN.id} /> and <SpellLink id={SPELLS.REVENGE.id} /> to avoid this.
          </>
        )}
      >
        <Requirement name="Lost Rage" thresholds={thresholds.rageDetails} />
      </Rule>

      <Rule
        name="Utility"
        description={(
          <>
            Warriors main raid utility comes from <SpellLink id={SPELLS.RALLYING_CRY.id} /> - it should be used on high damage spikes to help people survive.
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.RALLYING_CRY.id} />
        <AbilityRequirement spell={SPELLS.INTERCEPT.id} />
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

ProtectionWarriorChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default ProtectionWarriorChecklist;
