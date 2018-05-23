import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import PlayerBreakdownTab from 'Main/PlayerBreakdownTab';


import { ABILITIES_AFFECTED_BY_MASTERY } from '../../Constants';

class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    statTracker: StatTracker,
  };

  totalMasteryHealing = 0;
  totalMaxPotentialMasteryHealing = 0;

  masteryHealEvents = [];

  on_heal(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.includes(event.ability.guid);

      const healingDone = event.amount + (event.absorbed || 0) + (event.overheal || 0);

      if (isAbilityAffectedByMastery) {
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
    }
  }

  statistic() {
    const masteryEffectivenessPercent = this.totalMasteryHealing / this.totalMaxPotentialMasteryHealing;
    const masteryPercent = this.statTracker.currentMasteryPercentage;
    const avgEffectiveMasteryPercent = masteryEffectivenessPercent * masteryPercent;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEEP_HEALING.id} />}
        value={`${formatPercentage(masteryEffectivenessPercent)} %`}
        label={(
          <dfn data-tip={`The percent of your mastery that you benefited from on average (so always between 0% and 100%). Since you have ${formatPercentage(masteryPercent)}% mastery, this means that on average your heals were increased by ${formatPercentage(avgEffectiveMasteryPercent)}% by your mastery.`}>
            Mastery benefit
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(30);

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
