import SPELLS from 'common/SPELLS';
import { TALENTS_PALADIN } from 'common/TALENTS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PropTypes from 'prop-types';

const RetributionPaladinChecklist = ({ combatant, castEfficiency, thresholds }) => {
  console.log(castEfficiency);
  const AbilityRequirement = (props) => (
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
        name="Always be casting"
        description={
          <>
            You should try to avoid doing nothing during the fight. If you have to move, use your{' '}
            <SpellLink id={SPELLS.DIVINE_STEED.id} icon /> to minimize downtime. Also use ranged
            abilities like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> or{' '}
            <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon /> if you are out of melee range for
            extended periods of time.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.alwaysBeCasting} />
      </Rule>
      <Rule
        name="Use core abilities as often as possible"
        description={
          <>
            Spells with short cooldowns like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon />,{' '}
            <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon />, and{' '}
            <SpellLink id={SPELLS.CRUSADER_STRIKE.id} icon /> should be used as often as possible.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.CRUSADER_STRIKE.id} />
        <AbilityRequirement spell={SPELLS.JUDGMENT_CAST.id} />
        <AbilityRequirement spell={SPELLS.BLADE_OF_JUSTICE.id} />
        <AbilityRequirement spell={SPELLS.CONSECRATION_CAST.id} />
      </Rule>
      <Rule
        name="Use your cooldowns"
        description={
          <>
            Retribution Paladin is a very cooldown dependant spec. Make sure you are keeping spells
            like{' '}
            <SpellLink
              id={
                combatant.hasTalent(TALENTS_PALADIN.CRUSADE_TALENT)
                  ? TALENTS_PALADIN.CRUSADE_TALENT.id
                  : TALENTS_PALADIN.AVENGING_WRATH_TALENT.id
              }
              icon
            />{' '}
            and <SpellLink id={SPELLS.WAKE_OF_ASHES.id} /> on cooldown.
          </>
        }
      >
        {combatant.hasTalent(TALENTS_PALADIN.CRUSADE_TALENT) && (
          <AbilityRequirement spell={TALENTS_PALADIN.CRUSADE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_PALADIN.AVENGING_WRATH_MIGHT_TALENT) && (
          <AbilityRequirement spell={TALENTS_PALADIN.AVENGING_WRATH_MIGHT_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_PALADIN.WAKE_OF_ASHES_TALENT) && (
          <AbilityRequirement spell={TALENTS_PALADIN.WAKE_OF_ASHES_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_PALADIN.EXECUTION_SENTENCE_TALENT) && (
          <AbilityRequirement spell={TALENTS_PALADIN.EXECUTION_SENTENCE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_PALADIN.CRUSADE_TALENT) && (
          <Requirement
            name={
              <>
                Good first global with <SpellLink id={TALENTS_PALADIN.CRUSADE_TALENT.id} icon />
              </>
            }
            thresholds={thresholds.crusade}
          />
        )}
      </Rule>
      <Rule
        name="Use procs and buffs efficiently"
        description={
          <>
            Buffs and procs like <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> have a significant
            impact on your damage, use them well.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> procs used
            </>
          }
          thresholds={thresholds.artOfWar}
        />
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> debuffs consumed
            </>
          }
          thresholds={thresholds.judgment}
        />
      </Rule>
      <Rule
        name="Use your Holy Power efficently"
        description="Holy Power is your main resource, it's very important not to waste it."
      >
        <Requirement name="Holy Power efficiency" thresholds={thresholds.holyPowerDetails} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
      <Rule
        name="Use your utility and defensive spells"
        description={
          <>
            Use other spells in your toolkit to your advantage. For example, you can use{' '}
            <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} icon /> to mitigate some damage and{' '}
            <SpellLink id={SPELLS.LAY_ON_HANDS.id} icon /> to save your own or someone elses life.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.SHIELD_OF_VENGEANCE.id} />
        <AbilityRequirement spell={SPELLS.LAY_ON_HANDS.id} />
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} icon /> Absorb Used
            </>
          }
          thresholds={thresholds.shieldOfVengeance}
        />
      </Rule>
    </Checklist>
  );
};

RetributionPaladinChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default RetributionPaladinChecklist;
