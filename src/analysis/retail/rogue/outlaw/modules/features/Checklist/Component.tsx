import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

import { RTBSuggestion } from '../../spells/RollTheBonesEfficiency';

interface OutlawChecklistInputs extends ChecklistProps {
  rtbEfficiencies: RTBSuggestion[];
}

const OutlawRogueChecklist = ({
  combatant,
  castEfficiency,
  thresholds,
  rtbEfficiencies,
}: OutlawChecklistInputs) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Maximize your Roll the Bones usage"
        description={
          <>
            Efficient use of <SpellLink spell={TALENTS.ROLL_THE_BONES_TALENT} /> is a critical part
            of Outlaw rogue. You should try to keep as high of an uptime as possible with any of the
            buffs, and reroll efficiently to get higher value buffs.{' '}
            <SpellLink spell={SPELLS.TRUE_BEARING} /> and <SpellLink spell={SPELLS.BROADSIDE} /> are
            the highest value of the six possible buffs. You should reroll until you get one of
            them, or any two other buffs. Any high value roll should be kept for the full duration.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink spell={TALENTS.ROLL_THE_BONES_TALENT} /> uptime
            </>
          }
          thresholds={thresholds.rollTheBonesBuffs}
        />
        {rtbEfficiencies.map((suggestion: RTBSuggestion) => (
          <Requirement
            key={suggestion.label}
            name={`Reroll ${suggestion.label} efficiency`}
            thresholds={suggestion.suggestionThresholds}
          />
        ))}
      </Rule>
      <Rule
        name="Use your finishers efficiently"
        description={<>Finishers should typically be used at 1 below max combo points or higher.</>}
      >
        <Requirement name="Finisher combo point inefficiency" thresholds={thresholds.finishers} />
        <Requirement
          name={
            <>
              Time <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> spent on CD
            </>
          }
          thresholds={thresholds.betweenTheEyes}
          tooltip={
            <>
              This is the percentage of how much of the fight{' '}
              <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> was on cooldown. Generally{' '}
              <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> has to be used as soon as it comes off
              of cooldown. Cast should therefore only be delayed for a minimum amount of time in
              order to maximise debuff uptime{' '}
            </>
          }
        />
      </Rule>
      <Rule
        name="Make sure to use your opportunity procs"
        description={
          <>
            Your <SpellLink spell={SPELLS.OPPORTUNITY} /> proc will do more damage than a{' '}
            <SpellLink spell={SPELLS.SINISTER_STRIKE} />, so make sure to use{' '}
            <SpellLink spell={SPELLS.PISTOL_SHOT} /> as your combo point builder when the proc is
            available and you aren't already capped on combo points.
          </>
        }
      >
        <Requirement
          name={
            <>
              Delayed <SpellLink spell={SPELLS.OPPORTUNITY} /> procs
            </>
          }
          thresholds={thresholds.opportunity}
        />
      </Rule>
      <Rule
        name={
          <>
            Make sure to use your <SpellLink spell={TALENTS.AUDACITY_TALENT} /> procs
          </>
        } //"Make sure to use your <SpellLink spell={TALENTS.AUDACITY_TALENT.id}/> procs"
        description={
          <>
            Your <SpellLink spell={TALENTS.AUDACITY_TALENT} /> proc will be more valuable than a{' '}
            <SpellLink spell={SPELLS.SINISTER_STRIKE} /> or <SpellLink spell={SPELLS.PISTOL_SHOT} />
            , so make sure to use <SpellLink spell={SPELLS.AMBUSH} /> as your combo point builder
            when the proc is available and you aren't already capped on combo points.
          </>
        }
      >
        <Requirement
          name={
            <>
              Delayed <SpellLink spell={TALENTS.AUDACITY_TALENT} /> procs
            </>
          }
          thresholds={thresholds.audacity}
        />
      </Rule>
      <Rule
        name="Do not overcap your resources"
        description="You should try to always avoid overcapping your Energy and Combo Points."
      >
        <Requirement name="Energy generator efficiency" thresholds={thresholds.energyEfficiency} />
        <Requirement name="Combo Point efficiency" thresholds={thresholds.comboPointEfficiency} />
        <Requirement
          name="Energy regeneration efficiency"
          thresholds={thresholds.energyCapEfficiency}
        />
      </Rule>
      <Rule
        name="Use your cooldowns"
        description="Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming soon. Holding cooldowns too long will hurt your DPS."
      >
        <AbilityRequirement spell={TALENTS.ADRENALINE_RUSH_TALENT.id} />
        {combatant.hasTalent(TALENTS.GHOSTLY_STRIKE_TALENT) && (
          <AbilityRequirement spell={TALENTS.GHOSTLY_STRIKE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.MARKED_FOR_DEATH_TALENT) && (
          <AbilityRequirement spell={TALENTS.MARKED_FOR_DEATH_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.BLADE_RUSH_TALENT) && (
          <AbilityRequirement spell={TALENTS.BLADE_RUSH_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.KILLING_SPREE_TALENT) && (
          <AbilityRequirement spell={TALENTS.KILLING_SPREE_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.VANISH.id} />
        {combatant.hasTalent(TALENTS.SEPSIS_TALENT) && (
          <AbilityRequirement spell={TALENTS.SEPSIS_TALENT.id} />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default OutlawRogueChecklist;
