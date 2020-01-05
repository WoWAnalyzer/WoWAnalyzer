import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const WindwalkerMonkChecklist = ({ combatant, castEfficiency, thresholds }) => {
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
        name="Use core abilities as often as possible"
        description={(
          <>
            Spells with short cooldowns like <SpellLink id={SPELLS.RISING_SUN_KICK.id} /> and <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> should be used as often as possible.
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.RISING_SUN_KICK.id} />
        <AbilityRequirement spell={SPELLS.FISTS_OF_FURY_CAST.id} />
        {combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id) && <AbilityRequirement spell={SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id} />}
        {combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id) && <AbilityRequirement spell={SPELLS.CHI_WAVE_TALENT.id} />}
        {combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id) && <AbilityRequirement spell={SPELLS.CHI_BURST_TALENT.id} />}
        {(combatant.hasEssence(SPELLS.CONFLICT.traitId) ? combatant.hasMajor(SPELLS.CONFLICT.traitId) : false) && <AbilityRequirement spell={SPELLS.REVERSE_HARM.id} />}
      </Rule>
      <Rule
        name="Use your procs and short CDs"
        description={(
          <>
            Make sure to use your procs and spells at the correct time. Wasting <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs and not hitting all your <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> ticks is a loss of potential damage.
          </>
        )}
      >
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs used
            </>
          )}
          thresholds={thresholds.comboBreaker}
        />
        <Requirement
          name={(
            <>
              Average ticks hit with <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} />
            </>
          )}
          thresholds={thresholds.fistsofFury}
        />
      </Rule>
      <Rule
        name="Use your cooldowns effectively"
        description={(
          <>
            Your cooldowns have a big impact on your damage output. Make sure you use them as much as possible. <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} icon /> is both a defensive and offensive cooldown, but is mostly used offensively.
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.TOUCH_OF_DEATH.id} />
        <AbilityRequirement spell={SPELLS.TOUCH_OF_KARMA_CAST.id} />
        {!combatant.hasTalent(SPELLS.SERENITY_TALENT.id) && <AbilityRequirement spell={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} />}
        {combatant.hasTalent(SPELLS.SERENITY_TALENT.id) && <AbilityRequirement spell={SPELLS.SERENITY_TALENT.id} />}
        {combatant.hasTalent(SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id) && <AbilityRequirement spell={SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id} />}
        <Requirement
          name={(
            <>
              Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> used
            </>
          )}
          thresholds={thresholds.touchOfKarma}
        />
      </Rule>
      <Rule
        name="Manage your resources"
        description={(
          <>
            Windwalker is heavily dependent on having enough Chi to cast your core spells on cooldown. Wasting Chi either by generating while capped or using <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> and <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} icon /> too much will cause you to delay your hard hitting Chi spenders and lose damage.
          </>
        )}
      >
        {combatant.hasTalent(SPELLS.ENERGIZING_ELIXIR_TALENT.id) && <AbilityRequirement spell={SPELLS.ENERGIZING_ELIXIR_TALENT.id} />}
        {combatant.hasTalent(SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id) && <AbilityRequirement spell={SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id} />}
        <Requirement
          name={(
            <>
              Wasted cooldown reduction from <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> per minute
            </>
          )}
          thresholds={thresholds.blackoutKick}
        />
        <Requirement
          name="Chi wasted per minute"
          thresholds={thresholds.chiDetails}
        />
      </Rule>
      <Rule
        name="Don't break mastery"
        description={(
          <>
            Using the same damaging ability twice in a row will lose mastery benefit on the second cast and drop the <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} icon /> buff if specced.
          </>
        )}
      >
      <Requirement
        name={(
          <>
            Times <SpellLink id={SPELLS.COMBO_STRIKES.id} /> was broken
          </>
        )}
        thresholds={thresholds.comboStrikes}
      />
      {combatant.hasTalent(SPELLS.HIT_COMBO_TALENT) && (
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> uptime
            </>
          )}
          thresholds={thresholds.hitCombo}
        />
      )}
      </Rule>
      <Rule
        name="Use your defensive cooldowns effectively"
        description={(
          <>
            Make sure you use your defensive cooldowns at appropriate times throughout the fight. Make sure to use <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> as much as possible to maximize its offensive benefit and use <SpellLink id={SPELLS.DIFFUSE_MAGIC_TALENT.id} />/<SpellLink id={SPELLS.DAMPEN_HARM_TALENT.id} icon /> for dangerous periods of damage intake.
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.TOUCH_OF_KARMA_CAST.id} />
        {combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id) && <AbilityRequirement spell={SPELLS.DIFFUSE_MAGIC_TALENT.id} />}
        {combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id) && <AbilityRequirement spell={SPELLS.DAMPEN_HARM_TALENT.id} />}
        <Requirement
          name={(
            <>
              Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> used
            </>
          )}
          thresholds={thresholds.touchOfKarma}
        />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

WindwalkerMonkChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
    hasEssence: PropTypes.func.isRequired,
    hasMajor: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default WindwalkerMonkChecklist;
