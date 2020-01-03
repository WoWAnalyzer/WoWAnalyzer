import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
// import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
// import ItemLink from 'common/ItemLink';
import ResourceLink from 'common/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { TooltipElement } from 'common/Tooltip';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const DisciplinePriestChecklist = ({ combatant, castEfficiency, thresholds }) => {
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
            Using your core abilities as often as possible will typically result in better performance, remember to <SpellLink id={SPELLS.SMITE.id} /> as often as you can!
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.PENANCE_CAST.id} />
        {combatant.hasTalent(SPELLS.SCHISM_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SCHISM_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.POWER_WORD_SOLACE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.POWER_WORD_SOLACE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.DIVINE_STAR_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.SHADOW_COVENANT_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SHADOW_COVENANT_TALENT.id} />
        )}
      </Rule>

      <Rule
        name="Use cooldowns effectively"
        description={(
          <>
            Cooldowns are an important part of healing, try to use them to counter fight mechanics. For example if a boss has burst damage every 1.5 minutes, <SpellLink id={SPELLS.RAPTURE.id} /> should be used to counter it.
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.RAPTURE.id} />
        {!combatant.hasTalent(SPELLS.LUMINOUS_BARRIER_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.POWER_WORD_BARRIER_CAST.id} />
        )}
        {!combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHARED.id) && (
          <AbilityRequirement spell={SPELLS.SHADOWFIEND.id} />
        )}
        {combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHARED.id) && (
          <AbilityRequirement spell={SPELLS.MINDBENDER_TALENT_SHARED.id} />
        )}
        {combatant.hasTalent(SPELLS.HALO_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.HALO_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.LUMINOUS_BARRIER_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.LUMINOUS_BARRIER_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.EVANGELISM_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.EVANGELISM_TALENT.id} />
        )}
        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA1.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_MANA1.id} />
        )}
      </Rule>

      <Rule
        name="Use your supportive abilities"
        description="While you shouldn't aim to cast defensives and externals on cooldown, be aware of them and try to use them whenever effective. Not using them at all indicates you might not be aware of them enough or not utilizing them optimally."
      >
        <AbilityRequirement spell={SPELLS.PAIN_SUPPRESSION.id} />
        <AbilityRequirement spell={SPELLS.LEAP_OF_FAITH.id} />
        <AbilityRequirement spell={SPELLS.DESPERATE_PRAYER.id} />
      </Rule>

      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={(
          <>
            High downtime is inexcusable, while it may be tempting to not cast and save mana, Discipline's damage fillers such as <SpellLink id={SPELLS.SMITE.id} /> are extremely cheap. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and <TooltipElement content="You can ignore this while learning Discipline, but contributing DPS whilst healing is a major part of becoming a better than average player.">when you're not healing try to contribute some damage.*</TooltipElement>.
          </>
        )}
      >
        <Requirement name="Non healing time" thresholds={thresholds.nonHealingTimeSuggestionThresholds} />
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>

      <Rule
        name={<>Use all of your <ResourceLink id={RESOURCE_TYPES.MANA.id} /> effectively</>}
        description="If you have a large amount of mana left at the end of the fight that's mana you could have turned into healing. Try to use all your mana during a fight. A good rule of thumb is to try to match your mana level with the boss's health."
      >
        <Requirement name="Mana left" thresholds={thresholds.manaLeft} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

DisciplinePriestChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default DisciplinePriestChecklist;
