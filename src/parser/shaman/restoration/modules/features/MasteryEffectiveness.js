import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import PlayerBreakdownTab from 'interface/others/PlayerBreakdownTab';


import { ABILITIES_AFFECTED_BY_MASTERY } from '../../constants';

class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    statTracker: StatTracker,
  };

  totalMasteryHealing = 0;
  totalMaxPotentialMasteryHealing = 0;

  masteryHealEvents = [];

  on_byPlayer_heal(event) {
    const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.includes(event.ability.guid);

    const healingDone = event.amount + (event.absorbed || 0) + (event.overheal || 0);

    if (!isAbilityAffectedByMastery) {
      return;
    }

    const healthBeforeHeal = event.hitPoints - event.amount;
    const masteryEffectiveness = Math.max(0, 1 - healthBeforeHeal / event.maxHitPoints);

    // The base healing of the spell (excluding any healing added by mastery)
    const masteryPercent = this.statTracker.currentMasteryPercentage;
    const baseHealingDone = healingDone / (1 + masteryPercent * masteryEffectiveness);
    const masteryHealingDone = healingDone - baseHealingDone;
    // The max potential mastery healing if we had a mastery effectiveness of 100% on this spell. This does NOT include the base healing
    // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
    const maxPotentialMasteryHealing = baseHealingDone * masteryPercent; // * 100% mastery effectiveness

    this.totalMasteryHealing += Math.max(0, masteryHealingDone - (event.overheal || 0));
    this.totalMaxPotentialMasteryHealing += Math.max(0, maxPotentialMasteryHealing - (event.overheal || 0));

    this.masteryHealEvents.push({
      ...event,
      healthBeforeHeal,
      masteryEffectiveness,
      baseHealingDone,
      masteryHealingDone,
      maxPotentialMasteryHealing,
    });

    event.masteryEffectiveness = masteryEffectiveness;
  }

  // Totems count as pets, but are still affected by mastery.
  on_byPlayerPet_heal(event) {
    this.on_byPlayer_heal(event);
  }

  get masteryEffectivenessPercent() {
    return this.totalMasteryHealing / this.totalMaxPotentialMasteryHealing;
  }

  statistic() {
    const masteryPercent = this.statTracker.currentMasteryPercentage;
    const avgEffectiveMasteryPercent = this.masteryEffectivenessPercent * masteryPercent;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEEP_HEALING.id} />}
        value={`${formatPercentage(this.masteryEffectivenessPercent)} %`}
        position={STATISTIC_ORDER.CORE(30)}
        label={(
          <dfn data-tip={`The percent of your mastery that you benefited from on average (so always between 0% and 100%). Since you have ${formatPercentage(masteryPercent)}% mastery, this means that on average your heals were increased by ${formatPercentage(avgEffectiveMasteryPercent)}% by your mastery.`}>
            Mastery benefit
          </dfn>
        )}
      />
    );
  }

  get report() {
    let totalHealingWithMasteryAffectedAbilities = 0;
    let totalHealingFromMastery = 0;
    let totalMaxPotentialMasteryHealing = 0;

    const statsByTargetId = this.masteryHealEvents.reduce((obj, event) => {
      // Update the fight-totals
      totalHealingWithMasteryAffectedAbilities += event.amount;
      totalHealingFromMastery += event.masteryHealingDone;
      totalMaxPotentialMasteryHealing += event.maxPotentialMasteryHealing;

      // Update the player-totals
      if (!obj[event.targetID]) {
        const combatant = this.combatants.players[event.targetID];
        obj[event.targetID] = {
          combatant,
          healingReceived: 0,
          healingFromMastery: 0,
          maxPotentialHealingFromMastery: 0,
        };
      }
      const playerStats = obj[event.targetID];
      playerStats.healingReceived += event.amount;
      playerStats.healingFromMastery += event.masteryHealingDone;
      playerStats.maxPotentialHealingFromMastery += event.maxPotentialMasteryHealing;

      return obj;
    }, {});

    return {
      statsByTargetId,
      totalHealingWithMasteryAffectedAbilities,
      totalHealingFromMastery,
      totalMaxPotentialMasteryHealing,
    };
  }

  tab() {
    return {
      title: 'Mastery',
      url: 'mastery',
      render: () => (
        <PlayerBreakdownTab
          report={this.report}
          playersById={this.owner.playersById}
        />
      ),
    };
  }
}

export default MasteryEffectiveness;
