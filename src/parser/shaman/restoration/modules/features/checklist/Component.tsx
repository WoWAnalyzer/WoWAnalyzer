import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ResourceLink from 'common/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { TooltipElement } from 'common/Tooltip';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import { Trans } from '@lingui/macro';

const RestoShamanChecklist = ({ combatant, castEfficiency, thresholds }: any) => {
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
        name={<Trans id="shaman.restoration.checklist.efficientSpells">Use core efficient spells as often as possible</Trans>}
        description={(
          <Trans id="shaman.restoration.checklist.efficientSpells.description">
            Spells such as <SpellLink id={SPELLS.RIPTIDE.id} />, <SpellLink id={SPELLS.HEALING_RAIN_CAST.id} /> and <SpellLink id={SPELLS.HEALING_STREAM_TOTEM_CAST.id} /> are your most efficient spells available. Try to cast them as much as possible without overhealing. <TooltipElement content={<Trans id="shaman.restoration.checklist.efficientSpells.description.tooltip">When you're not bringing too many healers.</Trans>}>On Mythic*</TooltipElement> you can often still cast these spells more even if you were overhealing by casting it quicker when it comes off cooldown and improving your target selection.
            <a href="http://www.wowhead.com/restoration-shaman-rotation-guide#raid-healing-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
          </Trans>
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
        name={<Trans id="shaman.restoration.checklist.cooldownUsage">Use cooldowns effectively</Trans>}
        description={(
          <Trans id="shaman.restoration.checklist.cooldownUsage.description">
            Your cooldowns are an important contributor to your healing throughput. Try to get in as many efficient casts as the fight allows.
            <a href="http://www.wowhead.com/restoration-shaman-rotation-guide#throughput-cooldowns" target="_blank" rel="noopener noreferrer">More info.</a>
          </Trans>
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
        name={<Trans id="shaman.restoration.checklist.aoeSpell">Target AOE spells effectively</Trans>}
        description={<Trans id="shaman.restoration.checklist.aoeSpell.description">As a resto shaman our core AOE spells rely on not just who we target but where they are on the ground to maximize healing potential. You should plan you AOE spells ahead of time in preparation for where you expect raid members to be for the spells duration.</Trans>}
      >
        {thresholds.chainHealTargetThresholds.actual > 0 && (
          <Requirement name={(<Trans id="shaman.restoration.checklist.aoeSpell.chainHeal">Average <SpellLink id={SPELLS.CHAIN_HEAL.id} /> targets</Trans>)} thresholds={thresholds.chainHealTargetThresholds} />
        )}
        {thresholds.healingRainTargetThreshold.actual > 0 && (
          <Requirement name={(<Trans id="shaman.restoration.checklist.aoeSpell.healingRain">Average <SpellLink id={SPELLS.HEALING_RAIN_HEAL.id} /> targets</Trans>)} thresholds={thresholds.healingRainTargetThreshold} />
        )}
        {combatant.hasTalent(SPELLS.WELLSPRING_TALENT.id) && (
          <Requirement name={(<Trans id="shaman.restoration.checklist.aoeSpell.wellspring">Average <SpellLink id={SPELLS.WELLSPRING_TALENT.id} /> efficiency</Trans>)} thresholds={thresholds.wellspringTargetThreshold} />
        )}
        {combatant.hasTalent(SPELLS.EARTHEN_WALL_TOTEM_TALENT.id) && (
          <Requirement name={(<Trans id="shaman.restoration.checklist.aoeSpell.ewt">Average <SpellLink id={SPELLS.EARTHEN_WALL_TOTEM_TALENT.id} /> efficiency</Trans>)} thresholds={thresholds.ewtTargetThreshold} />
        )}
      </Rule>
      <Rule
        name={<Trans id="shaman.restoration.checklist.inactivity">Try to avoid being inactive for a large portion of the fight</Trans>}
        description={(
          <Trans id="shaman.restoration.checklist.inactivity.description">
            While it's suboptimal to always be casting as a healer you should still try to always be doing something during the entire fight and high downtime is inexcusable. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and <TooltipElement wrapperStyles={{ display: 'inline' }} content={<Trans id="shaman.restoration.checklist.inactivity.description.tooltip">While helping with damage would be optimal, it's much less important as a healer than any of the other suggestions on this checklist. You should ignore this suggestion while you are having difficulties with anything else.</Trans>}>when you're not healing try to contribute some damage*</TooltipElement>.
          </Trans>
        )}
      >
        <Requirement name={<Trans id="shaman.restoration.checklist.inactivity.nonHealTime">Non healing time</Trans>} thresholds={thresholds.nonHealingTimeSuggestionThresholds} />
        <Requirement name={<Trans id="shaman.restoration.checklist.inactivity.downtime">Downtime</Trans>} thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <Rule
        name={<Trans id="shaman.restoration.checklist.manaUsage">Use all of your <ResourceLink id={RESOURCE_TYPES.MANA.id} /> effectively</Trans>}
        description={<Trans id="shaman.restoration.checklist.manaUsage.description">If you have a large amount of mana left at the end of the fight that's mana you could have turned into healing. Try to use all your mana during a fight. A good rule of thumb is to try to match your mana level with the boss's health.</Trans>}
      >
        <Requirement name={<Trans id="shaman.restoration.checklist.manaUsage.manaLeft">Mana left</Trans>} thresholds={thresholds.manaLeft} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

RestoShamanChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default RestoShamanChecklist;
