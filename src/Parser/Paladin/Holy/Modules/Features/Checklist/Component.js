import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import ResourceLink from 'common/ResourceLink';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import Checklist from 'Parser/Core/Modules/Features/Checklist2';
import Rule from 'Parser/Core/Modules/Features/Checklist2/Rule';
import Requirement from 'Parser/Core/Modules/Features/Checklist2/Requirement';
import PreparationRule from 'Parser/Core/Modules/Features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'Parser/Core/Modules/Features/Checklist2/GenericCastEfficiencyRequirement';

class HolyPaladinChecklist extends React.PureComponent {
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
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
              Spells such as <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />, <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} /> and <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> (with <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_HEAL.id} />) are your most efficient spells available. Try to cast them as much as possible without overhealing. <dfn data-tip="When you're not bringing too many healers.">On Mythic*</dfn> you can often still cast these spells more even if you were overhealing by casting it quicker when it comes off cooldown and improving your target selection.{' '}
              <a href="https://www.wowhead.com/holy-paladin-rotation-guide#gameplay-and-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.HOLY_SHOCK_CAST.id} />
          <AbilityRequirement spell={SPELLS.LIGHT_OF_DAWN_CAST.id} />
          {combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id) && <AbilityRequirement spell={SPELLS.JUDGMENT_CAST.id} />}
          {combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT.id) && <AbilityRequirement spell={SPELLS.BESTOW_FAITH_TALENT.id} />}
          {combatant.hasTalent(SPELLS.LIGHTS_HAMMER_TALENT.id) && <AbilityRequirement spell={SPELLS.LIGHTS_HAMMER_TALENT.id} />}
          {combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id) && <AbilityRequirement spell={SPELLS.CRUSADER_STRIKE.id} />}
          {combatant.hasTalent(SPELLS.HOLY_PRISM_TALENT.id) && <AbilityRequirement spell={SPELLS.HOLY_PRISM_TALENT.id} />}
          <Requirement
            name={(
              <React.Fragment>
                Total filler <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} />s cast while{' '}
                <span style={{ whiteSpace: 'nowrap' }}><SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /></span> was available
              </React.Fragment>
            )}
            thresholds={thresholds.fillerFlashOfLight}
          />
        </Rule>
        <Rule
          name="Use cooldowns effectively"
          description={(
            <React.Fragment>
              Your cooldowns are an important contributor to your healing throughput. Try to get in as many efficient casts as the fight allows.{' '}
              <a href="https://www.wowhead.com/holy-paladin-rotation-guide#gameplay-and-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          {/* Avenging Crusader replaces Avenging Wrath */}
          {!combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.AVENGING_WRATH.id} />
          )}
          {combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.AVENGING_CRUSADER_TALENT.id} />
          )}
          {combatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.HOLY_AVENGER_TALENT.id} />
          )}
          {combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id) && (
            <AbilityRequirement
              spell={SPELLS.VELENS_FUTURE_SIGHT_BUFF.id}
              name={<ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} />}
            />
          )}
          <AbilityRequirement spell={SPELLS.AURA_MASTERY.id} />
          {/* We can't detect race, so disable this when it has never been cast. */}
          {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA.id) && (
            <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_MANA.id} />
          )}
        </Rule>
        <Rule
          name="Use your supportive abilities"
          description="While you shouldn't aim to cast defensives and externals on cooldown, be aware of them and try to use them whenever effective. Not using them at all indicates you might not be aware of them enough or not utilizing them optimally."
        >
          {combatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id) && <AbilityRequirement spell={SPELLS.RULE_OF_LAW_TALENT.id} />}
          <AbilityRequirement spell={SPELLS.DIVINE_STEED.id} />
          <AbilityRequirement spell={SPELLS.DIVINE_PROTECTION.id} />
          <AbilityRequirement spell={SPELLS.BLESSING_OF_SACRIFICE.id} />
          <AbilityRequirement spell={SPELLS.LAY_ON_HANDS.id} />
        </Rule>
        <Rule
          name={<React.Fragment>Position yourself well to maximize <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER.id} /></React.Fragment>}
          description={(
            <React.Fragment>
              <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER.id} /> has a big impact on the strength of your heals. Try to stay close to the people you are healing to benefit the most from your Mastery. Use <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} /> when healing people further away.
            </React.Fragment>
          )}
        >
          <Requirement name="Mastery effectiveness" thresholds={thresholds.masteryEffectiveness} />
        </Rule>
        <Rule
          name="Try to avoid being inactive for a large portion of the fight"
          description={(
            <React.Fragment>
              While it's suboptimal to always be casting as a healer you should still try to always be doing something during the entire fight and high downtime is inexcusable. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and <dfn data-tip="While helping with damage would be optimal, it's much less important as a healer than any of the other suggestions on this checklist. You should ignore this suggestion while you are having difficulties with anything else.">when you're not healing try to contribute some damage*</dfn>.
            </React.Fragment>
          )}
        >
          <Requirement name="Non healing time" thresholds={thresholds.nonHealingTimeSuggestionThresholds} />
          <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
        </Rule>
        <Rule
          name="Don't tunnel the tanks"
          description="A common misconception about Holy Paladins is that we should focus tanks when healing. This is actually inefficient. Let your beacons do most of the work, ask your co-healers to keep efficient HoTs on the tanks and only directly heal the tanks when they would otherwise die."
        >
          <Requirement name="Direct beacon healing" thresholds={thresholds.beaconHealing} />
        </Rule>
        <Rule
          name={<React.Fragment>Only use <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> when absolutely necessary</React.Fragment>}
          description={(
            <React.Fragment>
              <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> is an inefficient spell to cast compared to the alternatives. Try to only cast <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> when it will save someone's life or when you have to move and all other instant cast spells are on cooldown.
            </React.Fragment>
          )}
        >
          <Requirement name="Total filler casts per minute" thresholds={thresholds.fillerLightOfTheMartyrsCpm} />
          <Requirement
            name={(
              <React.Fragment>
                Total filler casts while <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> was available
              </React.Fragment>
            )}
            thresholds={thresholds.fillerLightOfTheMartyrsInefficientCpm}
          />
        </Rule>
        <Rule
          name={<React.Fragment>Use all of your <ResourceLink id={RESOURCE_TYPES.MANA.id} /> effectively</React.Fragment>}
          description="If you have a large amount of mana left at the end of the fight that's mana you could have turned into healing. Try to use all your mana during a fight. A good rule of thumb is to try to match your mana level with the boss's health."
        >
          <Requirement name="Mana left" thresholds={thresholds.manaLeft} />
        </Rule>
        <PreparationRule thresholds={thresholds} />
        <Rule
          name="Avoid overhealing"
          description="Pick the right targets when healing and use the right abilities at the right time. While overhealing still transfers to your beacons, it's still inefficient. Overhealing might be unavoidable when there's not a lot of damage taken (such as in normal mode) or when bringing too many healers."
        >
          <Requirement name={<SpellLink id={SPELLS.HOLY_SHOCK_HEAL.id} />} thresholds={thresholds.overhealing.holyShock} />
          <Requirement name={<SpellLink id={SPELLS.LIGHT_OF_DAWN_HEAL.id} />} thresholds={thresholds.overhealing.lightOfDawn} />
          <Requirement name={<SpellLink id={SPELLS.FLASH_OF_LIGHT.id} />} thresholds={thresholds.overhealing.flashOfLight} />
          {combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT.id) && (
            <Requirement
              name={<SpellLink id={SPELLS.BESTOW_FAITH_TALENT.id} />}
              thresholds={thresholds.overhealing.bestowFaith}
            />
          )}
        </Rule>
      </Checklist>
    );
  }
}

export default HolyPaladinChecklist;
