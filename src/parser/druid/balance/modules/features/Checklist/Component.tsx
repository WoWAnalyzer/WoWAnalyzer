import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

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

  return (
    <Checklist>
      <Rule
        name="Always be casting"
        description={(
          <>
            <em><b>Continuously chaining casts throughout an encounter is the single most important thing for achieving good DPS as a caster</b></em>. There shoule be no delay at all between your spell casts, it's better to start casting the wrong spell than to think for a few seconds and then cast the right spell. You should be able to handle a fight's mechanics with the minimum possible interruption to your casting. Some fights (like Argus) have unavoidable downtime due to phase transitions and the like, so in these cases 0% downtime will not be possible.
          </>
        )}
      >
        <Requirement name="Active Time" thresholds={thresholds.downtime} />
        <Requirement name="Cancelled Casts" thresholds={thresholds.cancelledCasts} />
      </Rule>
      <Rule
        name="Maintain your DoTs on the boss"
        description="DoTs are a big part of your damage. You should try to keep as high uptime on them as possible."
      >
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> uptime
            </>
          )}
          thresholds={thresholds.moonfireUptime}
        />
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.SUNFIRE.id} /> uptime
            </>
          )}
          thresholds={thresholds.sunfireUptime}
        />
        {combatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id) && (
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} /> uptime
              </>
            )}
            thresholds={thresholds.stellarFlareUptime}
          />
        )}
      </Rule>
      <Rule
        name="Avoid refreshing your DoTs too early"
        description="DoTs do very little direct damage, and you should avoid ever refreshing them with more than 30% duration remaining unless you have nothing else to cast while moving."
      >
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> good refreshes
            </>
          )}
          thresholds={thresholds.moonfireRefresh}
        />
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.SUNFIRE.id} /> good refreshes
            </>
          )}
          thresholds={thresholds.sunfireRefresh}
        />
        {combatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id) && (
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} /> good refreshes
              </>
            )}
            thresholds={thresholds.stellarFlareRefresh}
          />
        )}
      </Rule>
      <Rule
        name="Do not overcap your resources"
        description="While you sometimes cannot avoid overcapping, you should try to always avoid overcapping your Astral Power."
      >
        <Requirement name="Astral Power efficiency" thresholds={thresholds.astralPowerEfficiency} />
      </Rule>
      <Rule
        name="Use your cooldowns"
        description="Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming soon. Holding cooldowns too long will hurt your DPS."
      >
        {!combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.CELESTIAL_ALIGNMENT.id} />
        )}
        {combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.FORCE_OF_NATURE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.FORCE_OF_NATURE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.WARRIOR_OF_ELUNE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.WARRIOR_OF_ELUNE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.FURY_OF_ELUNE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.FURY_OF_ELUNE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.NEW_MOON_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.NEW_MOON_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Use your supportive abilities"
        description="While you should not aim to cast defensives and externals on cooldown, be aware of them and try to use them whenever effective. Not using them at all indicates you might not be aware of them enough."
      >
        <AbilityRequirement spell={SPELLS.INNERVATE.id} />
        <AbilityRequirement spell={SPELLS.BARKSKIN.id} />
        {combatant.hasTalent(SPELLS.RENEWAL_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.RENEWAL_TALENT.id} />
        )}
      </Rule>
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
