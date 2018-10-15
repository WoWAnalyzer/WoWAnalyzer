import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ResourceLink from 'common/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import Requirement from 'parser/shared/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class MistweaverMonkChecklist extends React.PureComponent {
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
            <>
              As a Mistweaver you only have a single rotational spell that should be cast on CD <SpellLink id={SPELLS.RENEWING_MIST.id} />.
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.RENEWING_MIST.id} />
        </Rule>

        <Rule
          name="Use cooldowns effectively"
          description={(
            <>
              Your cooldowns are an important contributor to your healing throughput. Try to get in as many efficient casts as the fight allows.{' '}
              <a href="https://www.peakofserenity.com/bfa/mistweaver/guide/" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.THUNDER_FOCUS_TEA.id} />
          {combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id) && <AbilityRequirement spell={SPELLS.MANA_TEA_TALENT.id} />}
          {combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id) && <AbilityRequirement spell={SPELLS.CHI_BURST_TALENT.id} />}
          {combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id) && <AbilityRequirement spell={SPELLS.CHI_WAVE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id) && <AbilityRequirement spell={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id} />}
          <AbilityRequirement spell={SPELLS.REVIVAL.id} />
          {/* We can't detect race, so disable this when it has never been cast. */}
          {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA1.id) && (
            <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_MANA1.id} />
          )}
        </Rule>

        <Rule
          name="Position yourself well to maximize your most effective spells"
          description={(
            <>
              Effective use of <SpellLink id={SPELLS.ESSENCE_FONT.id} /> has a big impact on your healing. Ensure you stay in melee to maximize the number of targets that can be in range of both <SpellLink id={SPELLS.ESSENCE_FONT.id} /> and other spells such as <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} />.
            </>
          )}
        >
        <Requirement
          name={(<><SpellLink id={SPELLS.ESSENCE_FONT.id} /> targets hit</>)} thresholds={thresholds.essenceFont}
        />
        {combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id) &&
        <Requirement name={(<><SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> % targets hit</>)} thresholds={thresholds.refreshingJadeWind} />}
        {combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id) &&
        <Requirement name={(<><SpellLink id={SPELLS.CHI_BURST_TALENT.id} /> targets hit</>)} thresholds={thresholds.chiBurst} />}
        </Rule>

        <Rule
          name="Pick the right tools for the fight"
          description="The throughput gain of some talents might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly."
        >
          {combatant.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id) &&
          <Requirement name={(<><SpellLink id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} /> mana returned</>)} thresholds={thresholds.spiritOfTheCrane} />}

          {combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id) &&
          <Requirement name={(<><SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> mana saved</>)} thresholds={thresholds.manaTea} />}

          {combatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id) &&
          <Requirement name={(<><SpellLink id={SPELLS.LIFECYCLES_TALENT.id} /> mana saved</>)} thresholds={thresholds.lifecycles} />}
        </Rule>

        <Rule
          name="Use your procs and short CDs"
          description="Make sure to use your procs and spells at the correct time."
        >
          <Requirement name={(<><SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} /> incorrect casts</>)} thresholds={thresholds.thunderFocusTea} />
          <Requirement name={(<><SpellLink id={SPELLS.ESSENCE_FONT.id} /> HOTS Used per Cast</>)} thresholds={thresholds.essenceFontMastery} />
        </Rule>

        <Rule
          name="Try to avoid being inactive for a large portion of the fight"
          description={(
            <>
              While it's suboptimal to always be casting as a healer you should still try to always be doing something during the entire fight and high downtime is inexcusable. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and <dfn data-tip="While helping with damage would be optimal, it's much less important as a healer than any of the other suggestions on this checklist. You should ignore this suggestion while you are having difficulties with anything else.">when you're not healing try to contribute some damage*</dfn>.
            </>
          )}
        >
          <Requirement name="Non healing time" thresholds={thresholds.nonHealingTimeSuggestionThresholds} />
          <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
        </Rule>

        <Rule
          name="Use your defensive cooldowns effectively"
          description="Make sure you use your personal and defensive cooldowns at appropriate times throughout the fight. While it may not make sense to use these abilities on cooldown, saving them for large damage events is ideal."
        >
          <AbilityRequirement spell={SPELLS.LIFE_COCOON.id} />
          {combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id) && <AbilityRequirement spell={SPELLS.DIFFUSE_MAGIC_TALENT.id} />}
          {combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id) && <AbilityRequirement spell={SPELLS.DAMPEN_HARM_TALENT.id} />}
          {combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id) && <AbilityRequirement spell={SPELLS.HEALING_ELIXIR_TALENT.id} />}
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
  }
}

export default MistweaverMonkChecklist;
