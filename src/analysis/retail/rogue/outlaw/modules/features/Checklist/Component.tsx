import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
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
import PropTypes from 'prop-types';

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
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

  return (
    <Checklist>
      <Rule
        name="Maximize your Roll the Bones usage"
        description={
          <>
            Efficient use of <SpellLink id={SPELLS.ROLL_THE_BONES.id} /> is a critical part of
            Outlaw rogue. You should try to keep as high of an uptime as possible with any of the
            buffs, and reroll efficiently to get higher value buffs.{' '}
            <SpellLink id={SPELLS.TRUE_BEARING.id} /> and <SpellLink id={SPELLS.BROADSIDE.id} /> are
            the highest value of the six possible buffs. You should reroll until you get one of
            them, or any two other buffs. Any high value roll should be kept for the full duration.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.ROLL_THE_BONES.id} /> uptime
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
        description={<>Finishers should typically be used at maximum combo points.</>}
      >
        <Requirement name="Finisher combo point inefficiency" thresholds={thresholds.finishers} />
        <Requirement
          name={
            <>
              Time <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> spent on CD
            </>
          }
          thresholds={thresholds.betweenTheEyes}
          tooltip={
            <>
              This is the percentage of how much of the fight{' '}
              <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> was on cooldown. Generally{' '}
              <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> has to be used as soon as it comes off
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
            Your <SpellLink id={SPELLS.OPPORTUNITY.id} /> proc will do more damage than a{' '}
            <SpellLink id={SPELLS.SINISTER_STRIKE.id} />, so make sure to use{' '}
            <SpellLink id={SPELLS.PISTOL_SHOT.id} /> as your combo point builder when the proc is
            available and you aren't already capped on combo points.
          </>
        }
      >
        <Requirement
          name={
            <>
              Delayed <SpellLink id={SPELLS.OPPORTUNITY.id} /> procs
            </>
          }
          thresholds={thresholds.opportunity}
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
        <AbilityRequirement spell={SPELLS.ADRENALINE_RUSH.id} />
        {combatant.hasTalent(SPELLS.GHOSTLY_STRIKE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.GHOSTLY_STRIKE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.MARKED_FOR_DEATH_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.BLADE_RUSH_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.BLADE_RUSH_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.KILLING_SPREE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.KILLING_SPREE_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.VANISH.id} />
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
          <AbilityRequirement spell={SPELLS.SEPSIS.id} />
        )}
        {combatant.hasCovenant(COVENANTS.VENTHYR.id) && (
          <AbilityRequirement spell={SPELLS.FLAGELLATION.id} />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

OutlawRogueChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
  rtbEfficiencies: PropTypes.object.isRequired,
};

export default OutlawRogueChecklist;
