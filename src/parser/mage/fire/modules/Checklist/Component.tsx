import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const FireMageChecklist = ({ combatant, castEfficiency, thresholds }: any) => {
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
        name="Use your cooldowns"
        description={(
          <>
            Using your cooldown abilities as often as possible can help raise your dps significantly. Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible unless you need to save them for a priority burst phase that is coming up soon.
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.COMBUSTION.id} />
        <AbilityRequirement spell={SPELLS.FIRE_BLAST.id} />
        {combatant.hasTalent(SPELLS.BLAST_WAVE_TALENT.id) && <AbilityRequirement spell={SPELLS.BLAST_WAVE_TALENT.id} />}
        {combatant.hasTalent(SPELLS.PHOENIX_FLAMES_TALENT.id) && <AbilityRequirement spell={SPELLS.PHOENIX_FLAMES_TALENT.id} />}
        {combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id) && <AbilityRequirement spell={SPELLS.MIRROR_IMAGE_TALENT.id} />}
        {combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id) && <AbilityRequirement spell={SPELLS.RUNE_OF_POWER_TALENT.id} />}
        {combatant.hasTalent(SPELLS.LIVING_BOMB_TALENT.id) && <AbilityRequirement spell={SPELLS.LIVING_BOMB_TALENT.id} />}
        {combatant.hasTalent(SPELLS.METEOR_TALENT.id) && (
          <Requirement
            name={<><SpellLink id={SPELLS.METEOR_TALENT.id} /></>}
            thresholds={thresholds.meteorEfficiency}
          />
        )}
      </Rule>
      <Rule
        name="Use Combustion effectively"
        description={(
          <>
            Using <SpellLink id={SPELLS.COMBUSTION.id} /> properly is one of the most important aspects of playing Fire well. Therefore it is critical that you make the most of the time that you have while Combustion is active. This include things such as not wasting time or GCDs while Combustion is active and ensuring that you properly setup for your "Combustion Window".
          </>
        )}
      >
        <Requirement
          name="Fire Blast Charges"
          thresholds={thresholds.fireBlastCombustionCharges}
          tooltip="When Combustion is getting close to becomming available, it is important to save a couple Fire Blast charges to be used during the Combustion Window. This will help ensure that you can get as many Hot Streak procs as possible during Combustion."
        />
        {combatant.hasTalent(SPELLS.PHOENIX_FLAMES_TALENT.id) && (
          <Requirement
            name="Phoenix Flames Charges"
            thresholds={thresholds.phoenixFlamesCombustionCharges}
            tooltip="When outside of Combustion, you should avoid using your Phoenix Flames charges so that they have time to come off cooldown before Combustion is available again. This will ensure that you have a couple charges so you can get as many Hot Streak procs as possible before Combustion ends. If you are about to cap on Phoenix Flames charges, then it is acceptable to use one."
          />
        )}
        {combatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id) && (
          <Requirement
            name="Combustion during Firestarter"
            thresholds={thresholds.firestarterCombustionUsage}
            tooltip="If you are talented into Firestarter, you should ensure that you do not cast Combustion while the boss is above 90% Health. This would be a waste considering every spell is guaranteed to crit while the boss is above 90% Health, which defeats the purpose of using Combustion. Instead, you should use Combustion when the boss gets to 89% so you can continue the streak of guaranteed crits once Firestarter finishes."
          />
        )}
        <Requirement
          name="Bad Scorch Uses"
          thresholds={thresholds.scorchSpellUsageDuringCombustion}
          tooltip="It is very important to use your time during Combustion wisely to get as many Hot Streak procs as possible before Combustion ends. To accomplish this, you should be stringing your guaranteed crit spells (Fireblast and Phoenix Flames) together to perpetually convert Heating Up to Hot Streak as many times as possible. If you run out of instant spells, cast Scorch instead."
        />
        <Requirement
          name="Bad Fireball Uses"
          thresholds={thresholds.fireballSpellUsageDuringCombustion}
          tooltip="Due to Combustion's short duration, you should never cast Fireball during Combustion. Instead, you should use your instant cast abilities like Fireblast and Phoenix Flames. If you run out of instant abilities, cast Scorch instead since it's cast time is shorter."
        />
      </Rule>
      <Rule
        name="Use your procs effectively"
        description={(
          <>
            Fire Mage revolves almost entirely around utilizing your procs effectively. Therefore it is very important that you manage your procs correctly to ensure that you get the most out of them.
          </>
        )}
      >
        <Requirement
          name="Hot Streak Proc Utilization"
          thresholds={thresholds.hotStreakUtilization}
          tooltip="Your Hot Streak Utilization. The bulk of your rotation revolves around successfully converting Heating Up procs into Hot Streak and using those Hot Streak procs effectively. Unless it is unavoidable, you should never let your Hot Streak procs expire without using them."
        />
        <Requirement
          name="Wasted Crits Per Minute"
          thresholds={thresholds.hotStreakWastedCrits}
          tooltip="In addition to converting Heating Up to Hot Streak, it is also very important to use your Hot Streak procs as quickly as possible. This is primarily because you are unable to get a Heating Up proc if you already have Hot Streak. Therefore, casting abilities that can give you Heating Up while you have Hot Streak would be a big waste."
        />
        <Requirement
          name="Hardcast into Hot Streak"
          thresholds={thresholds.hotStreakPreCasts}
          tooltip="Unless you are in Combustion and have Fire Blast/Phoenix Flames charges, you should always cast an ability that can generate Heating Up before using your Hot Streak proc. As an example, if you have Hot Streak and you cast Fireball > Pyroblast to use your Hot Streak, and one of those spells crit, then you will get Heating Up. If both spells crit, then you will instantly get a new Hot Streak proc."
        />
        {combatant.hasTalent(SPELLS.PHOENIX_FLAMES_TALENT.id) && (
          <Requirement
            name="Phoenix Flames Usage"
            thresholds={thresholds.phoenixFlamesHeatingUpUsage}
            tooltip="Because Phoenix Flames is guaranteed to crit, you should only use it to convert Heating Up into Hot Streak."
          />
        )}
        <Requirement
          name="Fire Blast Usage"
          thresholds={thresholds.fireBlastHeatingUpUsage}
          tooltip="Because Fire Blast is guaranteed to crit, you should only use it to convert Heating Up into Hot Streak."
        />
      </Rule>
      <Rule
        name="Use your talents effectively"
        description="Regardless of which talents you select, you should ensure that you are utilizing them properly. If you are having trouble effectively using a particular talent, you should consider taking a different talent that you can utilize properly or focus on effectively using the talents that you have selected."
      >
        {combatant.hasTalent(SPELLS.PYROCLASM_TALENT.id) && (
          <Requirement
            name="Pyroclasm Utilization"
            thresholds={thresholds.pyroclasmUtilization}
            tooltip="Pyroclasm has a chance to give you a buff that makes your next non instant Pyroblast deal 225% additional damage. You should ensure that you are using these procs (especially during Combustion) somewhat quickly to ensure you dont waste or overwrite any of these procs."
          />
        )}
        {combatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id) && (
          <Requirement
            name="Searing Touch Utilization"
            thresholds={thresholds.searingTouchUtilization}
            tooltip="Searing Touch causes your Scorch ability to deal 150% additional damage and be guaranteed to crit when the target is under 30% health. Therefore it is important that when the target is under 30% health, you cast Scorch instead of Fireball."
          />
        )}
        {combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id) && (
          <Requirement
            name="Rune of Power Uptime"
            thresholds={thresholds.runeOfPowerBuffUptime}
            tooltip="Using Rune of Power effectively means being able to stay within the range of it for it's entire duration. If you are unable to do so or if you frequently have to move out of the range of the buff, consider taking a different talent instead."
          />
        )}
        {combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id) && combatant.hasTalent(SPELLS.METEOR_TALENT.id) && (
          <Requirement
            name="Meteor Overall Utilization"
            thresholds={thresholds.meteorUtilization}
            tooltip="In order to get the most out of your Meteor casts, you should only cast Meteor while you are buffed by Rune of Power."
          />
        )}
        {combatant.hasTalent(SPELLS.METEOR_TALENT.id) && (
          <Requirement
            name="Meteor Utilization During Combustion"
            thresholds={thresholds.meteorCombustionUtilization}
            tooltip="In order to get the most out of your Combustion, you should always cast Meteor during Combustion. If Meteor will not come off cooldown before Combustion, then you should save Meteor for Combustion."
          />
        )}
      </Rule>
      <Rule
        name="Avoid downtime"
        description={(
          <>
            As a DPS, it is important to spend as much time casting as possible as if you are not casting then you are not doing damage. Therefore it is important to minimize your movements, stay within range of the target, and avoid cancelling casts if you can avoid it. While some fights will have an amount of time that is unavoidable downtime; the more you can minimize that downtime, the better.
          </>
        )}
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
        <Requirement name="Cancelled Casts" thresholds={thresholds.cancelledCasts} />
      </Rule>

      <PreparationRule thresholds={thresholds}>
        <Requirement name="Arcane Intellect active" thresholds={thresholds.arcaneIntellectUptime} />
      </PreparationRule>
    </Checklist>
  );
};

FireMageChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default FireMageChecklist;
