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

class RestoShamanChecklist extends React.PureComponent {
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
          name="Use core efficient spells as often as possible"
          description={(
            <>
              Spells such as <SpellLink id={SPELLS.RIPTIDE.id} />, <SpellLink id={SPELLS.HEALING_RAIN_CAST.id} /> and <SpellLink id={SPELLS.HEALING_STREAM_TOTEM_CAST.id} /> are your most efficient spells available. Try to cast them as much as possible without overhealing. <dfn data-tip="When you're not bringing too many healers.">On Mythic*</dfn> you can often still cast these spells more even if you were overhealing by casting it quicker when it comes off cooldown and improving your target selection. 
              <a href="http://www.wowhead.com/restoration-shaman-rotation-guide#raid-healing-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.RIPTIDE.id} />
          <AbilityRequirement spell={SPELLS.HEALING_RAIN_CAST.id} />
          {!combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id) && <AbilityRequirement spell={SPELLS.HEALING_STREAM_TOTEM_CAST.id} />}
          {combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id) && <AbilityRequirement spell={SPELLS.CLOUDBURST_TOTEM_TALENT.id} />}
          {combatant.hasTalent(SPELLS.UNLEASH_LIFE_TALENT.id) && <AbilityRequirement spell={SPELLS.UNLEASH_LIFE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.EARTHEN_WALL_TOTEM_TALENT.id) && <AbilityRequirement spell={SPELLS.EARTHEN_WALL_TOTEM_TALENT.id} />}
          {combatant.hasTalent(SPELLS.WELLSPRING_TALENT.id) && <AbilityRequirement spell={SPELLS.WELLSPRING_TALENT.id} />}
          {combatant.hasTalent(SPELLS.DOWNPOUR_TALENT.id) && <AbilityRequirement spell={SPELLS.DOWNPOUR_TALENT.id} />}
        </Rule>
        <Rule
          name="Use cooldowns effectively"
          description={(
            <>
              Your cooldowns are an important contributor to your healing throughput. Try to get in as many efficient casts as the fight allows. 
              <a href="http://www.wowhead.com/restoration-shaman-rotation-guide#throughput-cooldowns" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.HEALING_TIDE_TOTEM_CAST.id} />
          <AbilityRequirement spell={SPELLS.SPIRIT_LINK_TOTEM.id} />
          {combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id) && (
            <AbilityRequirement spell={SPELLS.ASCENDANCE_TALENT_RESTORATION.id} />
          )}
          {/* We can't detect race, so disable this when it has never been cast. */}
          {castEfficiency.getCastEfficiencyForSpellId(SPELLS.BERSERKING.id) && (
            <AbilityRequirement spell={SPELLS.BERSERKING.id} />
          )}
        </Rule>
        <Rule
          name={(<>Maximize <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> usage</>
          )}
          description={(
            <>
              <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> buffed <SpellLink id={SPELLS.HEALING_WAVE.id} /> can make for some very efficient healing. 
              You should try to use as many of the generated tidal waves as you can. You should also avoid using <SpellLink id={SPELLS.HEALING_WAVE.id} /> or <SpellLink id={SPELLS.HEALING_SURGE_RESTORATION.id} /> without a tidal wave.
            </>
          )}
        >
          <Requirement name={(<>Unused <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /></>)} thresholds={thresholds.unusedTidalWavesThresholds} />
          <Requirement name={(<>Unbuffed <SpellLink id={SPELLS.HEALING_SURGE_RESTORATION.id} /></>)} thresholds={thresholds.unbuffedHealingSurgesThresholds} />
          <Requirement name={(<>Unbuffed <SpellLink id={SPELLS.HEALING_WAVE.id} /></>)} thresholds={thresholds.unbuffedHealingWavesThresholds} />
        </Rule>
        <Rule
          name="Target AOE spells effectively"
          description="As a resto shaman our core AOE spells rely on not just who we target but where they are on the ground to maximize healing potential. You should plan you AOE spells ahead of time in preparation for where you expect raid members to be for the spells duration."
        >
          <Requirement name={(<>Average <SpellLink id={SPELLS.CHAIN_HEAL.id} /> targets</>)} thresholds={thresholds.chainHealTargetThresholds} />
          <Requirement name={(<>Average <SpellLink id={SPELLS.HEALING_RAIN_HEAL.id} /> targets</>)} thresholds={thresholds.healingRainTargetThreshold} />
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

export default RestoShamanChecklist;
