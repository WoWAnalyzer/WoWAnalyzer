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

const HolyPriestChecklist = ({ combatant, castEfficiency, thresholds }) => {
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
        <AbilityRequirement spell={SPELLS.HOLY_WORD_SERENITY.id} />
        <AbilityRequirement spell={SPELLS.HOLY_WORD_SANCTIFY.id} />
        <AbilityRequirement spell={SPELLS.PRAYER_OF_MENDING_CAST.id} />

        {combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.DIVINE_STAR_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.HALO_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.HALO_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.CIRCLE_OF_HEALING_TALENT.id} />
        )}

      </Rule>

      <Rule
        name="Use cooldowns effectively"
        description={(
          <>
            Cooldowns are an important part of healing, try to use them to counter fight mechanics. For example if a boss has burst damage every 3 minutes, <SpellLink id={SPELLS.DIVINE_HYMN_CAST.id} /> should be used to counter it.
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.GUARDIAN_SPIRIT.id} />
        <AbilityRequirement spell={SPELLS.DIVINE_HYMN_CAST.id} />
        <AbilityRequirement spell={SPELLS.DESPERATE_PRAYER.id} />
        <AbilityRequirement spell={SPELLS.SYMBOL_OF_HOPE.id} />

        {combatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.HOLY_WORD_SALVATION_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.APOTHEOSIS_TALENT.id} />
        )}

        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA1.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_MANA1.id} />
        )}
      </Rule>

      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={(
          <>
            High downtime is inexcusable, while it may be tempting to not cast and save mana, Holy's damage filler <SpellLink id={SPELLS.SMITE.id} /> is free. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and <TooltipElement content="You can ignore this while learning Holy, but contributing DPS whilst healing is a major part of becoming a better than average player.">when you're not healing try to contribute some damage.*</TooltipElement>.
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

HolyPriestChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default HolyPriestChecklist;
