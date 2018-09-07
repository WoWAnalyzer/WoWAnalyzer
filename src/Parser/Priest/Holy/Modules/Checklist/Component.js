import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS/index';
// import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
// import ItemLink from 'common/ItemLink';
import ResourceLink from 'common/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Checklist from 'Parser/Core/Modules/Features/Checklist2/index';
import Rule from 'Parser/Core/Modules/Features/Checklist2/Rule';
import Requirement from 'Parser/Core/Modules/Features/Checklist2/Requirement';
import PreparationRule from 'Parser/Core/Modules/Features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'Parser/Core/Modules/Features/Checklist2/GenericCastEfficiencyRequirement';

class HolyPriestChecklist extends Checklist {
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
  };

  static dependencies = {

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
              Using your core abilities as often as possible will typically result in better performance, remember to <SpellLink id={SPELLS.SMITE.id} /> as often as you can!
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.HOLY_WORD_SERENITY.id} />
          <AbilityRequirement spell={SPELLS.HOLY_WORD_SANCTIFY.id} />
          <AbilityRequirement spell={SPELLS.PRAYER_OF_MENDING_CAST.id} />

          {combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.DIVINE_STAR_TALENT.id} />
          )}
          {combatant.hasTalent(SPELLS.HALO_HEAL.id) && (
            <AbilityRequirement spell={SPELLS.HALO_HEAL.id} />
          )}
          {combatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.CIRCLE_OF_HEALING_TALENT.id} />
          )}

        </Rule>

        <Rule
          name="Use cooldowns effectively"
          description={(
            <React.Fragment>
              Cooldowns are an important part of healing, try to use them to counter fight mechanics. For example if a boss has burst damage every 3 minutes, <SpellLink id={SPELLS.DIVINE_HYMN_CAST.id} /> should be used to counter it.
            </React.Fragment>
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
            <React.Fragment>
              High downtime is inexcusable, while it may be tempting to not cast and save mana, Holy's damage filler <SpellLink id={SPELLS.SMITE.id} /> is free. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and <dfn data-tip="You can ignore this while learning Holy, but contributing DPS whilst healing is a major part of becoming a better than average player.">when you're not healing try to contribute some damage.*</dfn>.
            </React.Fragment>
          )}
        >
          <Requirement name="Non healing time" thresholds={thresholds.nonHealingTimeSuggestionThresholds} />
          <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
        </Rule>

        <Rule
          name="Open the fight with 20 stacks of prayer of mending"
          description={(
            <React.Fragment>
              You can stack up to 10 charges of <SpellLink id={SPELLS.PRAYER_OF_MENDING_CAST.id} /> on two members of the raid group <dfn data-tip="You will need to start stacking 30 seconds before the pull. Make sure you pay attention!">before the boss is pulled</dfn>. This is a simple and free way to increase your healing numbers.
            </React.Fragment>
          )}
        >
          <Requirement name="Opening prayer of mending stacks" thresholds={this.prePom} />
        </Rule>

        <Rule
          name={<React.Fragment>Use all of your <ResourceLink id={RESOURCE_TYPES.MANA.id} /> effectively</React.Fragment>}
          description="If you have a large amount of mana left at the end of the fight that's mana you could have turned into healing. Try to use all your mana during a fight. A good rule of thumb is to try to match your mana level with the boss's health."
        >
          <Requirement name="Mana left" thresholds={thresholds.manaLeft} />
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default HolyPriestChecklist;
