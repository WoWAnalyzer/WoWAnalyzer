import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const AssassinationRogueChecklist = ({ combatant, castEfficiency, thresholds }) => {
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
        name="Maintain your DoTs on the boss"
        description="DoTs are a big part of your damage. You should try to keep as high uptime on them as possible, but do not refresh them too early"
      >
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.GARROTE.id} /> uptime
            </>
          )}
          thresholds={thresholds.garroteUptime}
        />
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.RUPTURE.id} /> uptime
            </>
          )}
          thresholds={thresholds.ruptureUptime}
        />
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.GARROTE.id} /> effective refresh duration
            </>
          )}
          thresholds={thresholds.garroteEfficiency}
        />
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.RUPTURE.id} /> effective refresh duration
            </>
          )}
          thresholds={thresholds.ruptureEfficiency}
        />
      </Rule>
      <Rule
        name="Do not overcap your resources"
        description="You should try to always avoid overcapping your Energy and Combo Points."
      >
        <Requirement name="Energy generator efficiency" thresholds={thresholds.energyEfficiency} />
        <Requirement name="Combo Point efficiency" thresholds={thresholds.comboPointEfficiency} />
        <Requirement name="Energy regeneration efficiency" thresholds={thresholds.energyCapEfficiency} />
        {combatant.hasTalent(SPELLS.BLINDSIDE_TALENT.id) && (
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.BLINDSIDE_TALENT.id} /> efficiency
              </>
            )}
            thresholds={thresholds.blindsideEfficiency}
          />
        )}
      </Rule>
      <Rule
        name="Use your cooldowns"
        description="Your cooldowns are a major contributor to your DPS, and should be used as frequently as possible throughout a fight. A cooldown should be held on to only if a priority DPS phase is coming soon. Holding cooldowns too long will hurt your DPS."
      >
        <AbilityRequirement spell={SPELLS.VENDETTA.id} />
        {combatant.hasTalent(SPELLS.EXSANGUINATE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.EXSANGUINATE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.TOXIC_BLADE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.TOXIC_BLADE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.MARKED_FOR_DEATH_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Maximize Vanish usage"
        description="Your level 30 talent turns Vanish into a powerful DPS cooldown, significantly buffing the next 1-3 casts. Making sure to cast the correct abilities during this short window is important to maximizing your DPS. Check Suggestions for more details."
      >
        <AbilityRequirement spell={SPELLS.VANISH.id} />
        {combatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id) && (
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.SUBTERFUGE_BUFF.id} />s with atleast one <SpellLink id={SPELLS.GARROTE.id} /> cast
              </>
            )}
            thresholds={thresholds.subterfugeEfficiency}
          />
        )}
        {combatant.hasTalent(SPELLS.MASTER_ASSASSIN_TALENT.id) && (
          <Requirement
            name={(
              <>
                Good casts during <SpellLink id={SPELLS.MASTER_ASSASSIN_TALENT.id} />
              </>
            )}
            thresholds={thresholds.masterAssassinEfficiency}
          />
        )}
        {combatant.hasTalent(SPELLS.NIGHTSTALKER_TALENT.id) && (
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.VANISH.id} />es spent on snapshotting <SpellLink id={SPELLS.RUPTURE.id} />
              </>
            )}
            thresholds={thresholds.nightstalkerEfficiency}
          />
        )}
        {combatant.hasTalent(SPELLS.NIGHTSTALKER_TALENT.id) && (
          <Requirement
            name={(
              <>
                On pull opener spent on snapshotting <SpellLink id={SPELLS.RUPTURE.id} /> or <SpellLink id={SPELLS.GARROTE.id} />
              </>
            )}
            thresholds={thresholds.nightstalkerOpenerEfficiency}
          />
        )}
        {(combatant.hasTalent(SPELLS.NIGHTSTALKER_TALENT.id)) && (
          <Requirement
            name={(
              <>
                Lost snapshotted <SpellLink id={SPELLS.RUPTURE.id} /> due to early refreshes
              </>
            )}
            thresholds={thresholds.garroteSnapshotEfficiency}
          />
        )}
        {(combatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id) || combatant.hasTalent(SPELLS.NIGHTSTALKER_TALENT.id)) && (
          <Requirement
            name={(
              <>
                Lost snapshotted <SpellLink id={SPELLS.GARROTE.id} /> due to early refreshes
              </>
            )}
            thresholds={thresholds.garroteSnapshotEfficiency}
          />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

AssassinationRogueChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default AssassinationRogueChecklist;
