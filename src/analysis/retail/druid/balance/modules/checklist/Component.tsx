import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PropTypes from 'prop-types';

import { TALENTS_DRUID } from 'common/TALENTS';

const BalanceDruidChecklist = ({ combatant, castEfficiency, thresholds }: any) => {
  const AbilityRequirement = (props: any) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

  const alwaysBeCastingRule = (
    <Rule
      name="Always be casting"
      description={
        <>
          <em>
            <b>
              Continuously chaining casts throughout an encounter is the single most important thing
              for achieving good DPS as a caster
            </b>
          </em>
          . There shoule be no delay at all between your spell casts, it's better to start casting
          the wrong spell than to think for a few seconds and then cast the right spell. You should
          be able to handle a fight's mechanics with the minimum possible interruption to your
          casting. It is particularly important that you plan your cooldowns to take place during
          time when you won't be interrupted by mechanics.
          <br />
          <br />
          Some fights have unavoidable downtime due to phase transitions and the like, so in these
          cases 0% downtime will not be possible, however you should still plan your cooldowns such
          that you have no downtime during them.
        </>
      }
    >
      <Requirement name="Active Time" thresholds={thresholds.downtime} />
      <Requirement name="Cancelled Casts" thresholds={thresholds.cancelledCasts} />
    </Rule>
  );

  const dotRule = (
    <Rule
      name="Maintain your DoTs"
      description="DoTs are a big part of your damage and do great damage per cast time if allowed
        to tick for their full duration. You should try to maximize their uptime on targets.
        However, your DoTs do very little direct damage, and should not be refreshed with
        more than 30% duration remaining unless you have nothing else to cast while moving."
    >
      <Requirement
        name={
          <>
            <SpellLink id={SPELLS.MOONFIRE_DEBUFF.id} /> uptime
          </>
        }
        thresholds={thresholds.moonfireUptime}
      />
      <Requirement
        name={
          <>
            <SpellLink id={SPELLS.MOONFIRE_DEBUFF.id} /> good refreshes
          </>
        }
        thresholds={thresholds.moonfireRefresh}
      />
      <Requirement
        name={
          <>
            <SpellLink id={SPELLS.SUNFIRE.id} /> uptime
          </>
        }
        thresholds={thresholds.sunfireUptime}
      />
      <Requirement
        name={
          <>
            <SpellLink id={SPELLS.SUNFIRE.id} /> good refreshes
          </>
        }
        thresholds={thresholds.sunfireRefresh}
      />
      {combatant.hasTalent(TALENTS_DRUID.STELLAR_FLARE_TALENT) && (
        <Requirement
          name={
            <>
              <SpellLink id={TALENTS_DRUID.STELLAR_FLARE_TALENT.id} /> uptime
            </>
          }
          thresholds={thresholds.stellarFlareUptime}
        />
      )}
      {combatant.hasTalent(TALENTS_DRUID.STELLAR_FLARE_TALENT) && (
        <Requirement
          name={
            <>
              <SpellLink id={TALENTS_DRUID.STELLAR_FLARE_TALENT.id} /> good refreshes
            </>
          }
          thresholds={thresholds.stellarFlareRefresh}
        />
      )}
    </Rule>
  );

  const eclipseRule = (
    <Rule
      name="Use Eclipse"
      description={
        <>
          Getting into <SpellLink id={SPELLS.ECLIPSE.id} /> quickly is a major contributor to your
          damage. It procs our 4 piece <SpellLink id={SPELLS.TOUCH_THE_COSMOS.id} /> as well as many
          elements of our talent tree such as
          <SpellLink id={SPELLS.BALANCE_OF_ALL_THINGS_LUNAR.id} />. Which filler you use in eclipse
          is now less important than just getting into eclipse in general, however as a rule of
          thumb we should always enter <SpellLink id={SPELLS.ECLIPSE_LUNAR.id} /> even in single
          target and we should always cast <SpellLink id={SPELLS.WRATH.id} /> in single target and{' '}
          <SpellLink id={SPELLS.STARFIRE.id} /> if there are 2 or more targets.
        </>
      }
    >
      <Requirement name="Correct fillers used" thresholds={thresholds.fillerUsage} />
      <Requirement name="Starsurge used during Eclipse" thresholds={thresholds.starsurgeUsage} />
    </Rule>
  );

  // FIXME this is basically deactivated - will need to be replaced in Guide
  // const resourceRule = (
  //   <Rule
  //     name="Do not overcap your resources"
  //     description={
  //       <>
  //         While you sometimes cannot avoid overcapping, you should try to avoid overcapping your
  //         Astral Power. You should never overcap Astral Power during{' '}
  //         <SpellLink id={SPELLS.ECLIPSE.id} /> or <SpellLink id={cooldownAbility(combatant).id} />.
  //       </>
  //     }
  //   ></Rule>
  // );

  const cooldownsRule = (
    <Rule
      name="Use your cooldowns"
      description="Your cooldowns are a major contributor to your DPS, and should be used as
        frequently as possible throughout a fight. A cooldown should be held on to only if a priority
        DPS phase is coming soon. Holding cooldowns too long will hurt your DPS."
    >
      {combatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT) ? (
        <AbilityRequirement spell={TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id} />
      ) : (
        <AbilityRequirement spell={SPELLS.CELESTIAL_ALIGNMENT.id} />
      )}
      {combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
        <AbilityRequirement spell={SPELLS.CONVOKE_SPIRITS.id} />
      )}
      {combatant.hasTalent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT) && (
        <AbilityRequirement spell={TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id} />
      )}
      {combatant.hasTalent(TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT) && (
        <AbilityRequirement spell={TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT.id} />
      )}
      {combatant.hasTalent(TALENTS_DRUID.FURY_OF_ELUNE_TALENT) && (
        <AbilityRequirement spell={TALENTS_DRUID.FURY_OF_ELUNE_TALENT.id} />
      )}
      {combatant.hasTalent(TALENTS_DRUID.NEW_MOON_TALENT) && (
        <AbilityRequirement spell={TALENTS_DRUID.NEW_MOON_TALENT.id} />
      )}
    </Rule>
  );

  const supportRule = (
    <Rule
      name="Use your supportive abilities"
      description="While you should not aim to cast defensives and externals on cooldown,
        be aware of them and try to use them whenever effective.
        Not using them at all indicates you might not be aware of them enough."
    >
      {combatant.hasTalent(TALENTS_DRUID.INNERVATE_TALENT) && (
        <AbilityRequirement spell={TALENTS_DRUID.INNERVATE_TALENT.id} />
      )}
      <AbilityRequirement spell={SPELLS.BARKSKIN.id} />
      {combatant.hasTalent(TALENTS_DRUID.RENEWAL_TALENT) && (
        <AbilityRequirement spell={TALENTS_DRUID.RENEWAL_TALENT.id} />
      )}
    </Rule>
  );

  return (
    <Checklist>
      {alwaysBeCastingRule}
      {dotRule}
      {eclipseRule}
      {/*{resourceRule}*/}
      {cooldownsRule}
      {supportRule}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

BalanceDruidChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default BalanceDruidChecklist;
