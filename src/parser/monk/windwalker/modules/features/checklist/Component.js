import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/core/modules/features/Checklist2';
import Rule from 'parser/core/modules/features/Checklist2/Rule';
import Requirement from 'parser/core/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/core/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/core/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class WindwalkerMonkChecklist extends React.PureComponent {
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
          name="Use core abilities as often as possible"
          description={(
            <React.Fragment>
              Spells with short cooldowns like <SpellLink id={SPELLS.RISING_SUN_KICK.id} /> and <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> should be used as often as possible.
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.RISING_SUN_KICK.id} />
          <AbilityRequirement spell={SPELLS.FISTS_OF_FURY_CAST.id} />
          {combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id) && <AbilityRequirement spell={SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id} />}
          {combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id) && <AbilityRequirement spell={SPELLS.CHI_WAVE_TALENT.id} />}
        </Rule>
        <Rule
          name="Use your procs and short CDs"
          description={(
            <React.Fragment>
              Make sure to use your procs and spells at the correct time. Wasting <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs and not hitting all your <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> ticks is a loss of potential damage.
            </React.Fragment>
          )}
        >
          <Requirement
            name={(
              <React.Fragment>
                <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs used 
              </React.Fragment>
            )}
            thresholds={thresholds.comboBreaker}
          />
          <Requirement
            name={(
              <React.Fragment>
                Average ticks hit with <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} />
              </React.Fragment>
            )}
            thresholds={thresholds.fistsofFury}
          />
        </Rule>
        <Rule
          name="Use your cooldowns effectively"
          description={(
            <React.Fragment>
              Your cooldowns have a big impact on your damage output. Make sure you use them as much as possible. <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} icon /> is both a defensive and offensive cooldown, but is mostly used offensively.
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.TOUCH_OF_DEATH.id} />
          <AbilityRequirement spell={SPELLS.TOUCH_OF_KARMA_CAST.id} />
          {!combatant.hasTalent(SPELLS.SERENITY_TALENT.id) && <AbilityRequirement spell={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} />}
          {combatant.hasTalent(SPELLS.SERENITY_TALENT.id) && <AbilityRequirement spell={SPELLS.SERENITY_TALENT.id} />}
          {combatant.hasTalent(SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id) && <AbilityRequirement spell={SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id} />}
          <Requirement
            name={(
              <React.Fragment>
                Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> used
              </React.Fragment>
            )}
            thresholds={thresholds.touchOfKarma}
          />
        </Rule>
        <Rule
          name="Manage your resources"
          description={(
            <React.Fragment>
              Windwalker is heavily dependent on having enough Chi to cast your core spells on cooldown. Wasting Chi either by generating while capped or using <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> and <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} icon /> too much will cause you to delay your hard hitting Chi spenders and lose damage.
            </React.Fragment>
          )}
        >
          {combatant.hasTalent(SPELLS.ENERGIZING_ELIXIR_TALENT.id) && <AbilityRequirement spell={SPELLS.ENERGIZING_ELIXIR_TALENT.id} />}
          {combatant.hasTalent(SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id) && <AbilityRequirement spell={SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id} />}
          <Requirement
            name={(
              <React.Fragment>
                Wasted cooldown reduction from <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> per minute
              </React.Fragment>
            )}
            thresholds={thresholds.blackoutKick}
          />
          <Requirement
            name="Chi wasted per minute"
            thresholds={thresholds.chiDetails}
          />
          <Requirement
            name={(
              <React.Fragment>
                Bad <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> casts
              </React.Fragment>
            )}
            thresholds={thresholds.spinningCraneKick}
          />
        </Rule>
        <Rule
          name="Don't break mastery"
          description={(
            <React.Fragment>
              Using the same damaging ability twice in a row will lose mastery benefit on the second cast and drop the <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} icon /> buff if specced.
            </React.Fragment>
          )}
         >
         <Requirement
           name={(
             <React.Fragment>
               Times <SpellLink id={SPELLS.COMBO_STRIKES.id} /> was broken
             </React.Fragment>
           )}
           thresholds={thresholds.comboStrikes}
         />
         {combatant.hasTalent(SPELLS.HIT_COMBO_TALENT) && (
           <Requirement
             name={(
               <React.Fragment>
                 <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> uptime
               </React.Fragment>
             )}
             thresholds={thresholds.hitCombo}
          />)}
        </Rule>
        <Rule
          name="Use your defensive cooldowns effectively"
          description={(
            <React.Fragment>
              Make sure you use your defensive cooldowns at appropriate times throughout the fight. Make sure to use <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> as much as possible to maximize its offensive benefit and use <SpellLink id={SPELLS.DIFFUSE_MAGIC_TALENT.id} />/<SpellLink id={SPELLS.DAMPEN_HARM_TALENT.id} icon /> for dangerous periods of damage intake.
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.TOUCH_OF_KARMA_CAST.id} />
          {combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id) && <AbilityRequirement spell={SPELLS.DIFFUSE_MAGIC_TALENT.id} />}
          {combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id) && <AbilityRequirement spell={SPELLS.DAMPEN_HARM_TALENT.id} />}
          <Requirement
            name={(
              <React.Fragment>
                Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> used
              </React.Fragment>
            )}
            thresholds={thresholds.touchOfKarma}
          />
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default WindwalkerMonkChecklist;
