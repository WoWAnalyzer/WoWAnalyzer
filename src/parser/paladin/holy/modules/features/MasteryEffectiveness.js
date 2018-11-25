import React from 'react';
import { Trans, t } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import { i18n } from 'interface/RootLocalizationProvider';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import MasteryRadiusImage from 'interface/images/mastery-radius.png';
import PlayerBreakdownTab from 'interface/others/PlayerBreakdownTab';

import BeaconTargets from '../beacons/BeaconTargets';
import { ABILITIES_AFFECTED_BY_MASTERY } from '../../constants';

const debug = false;

class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    beaconTargets: BeaconTargets,
    statTracker: StatTracker,
  };

  lastPlayerPositionUpdate = null;

  masteryHealEvents = [];

  on_cast(event) {
    if (this.owner.byPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }
  on_damage(event) {
    if (this.owner.toPlayer(event)) {
      // Damage coordinates are for the target, so they are only accurate when done TO player
      this.updatePlayerPosition(event);
    }
  }
  on_energize(event) {
    if (this.owner.toPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }
  on_heal(event) {
    if (this.owner.toPlayer(event)) {
      // Do this before checking if this was done by player so that self-heals will apply full mastery properly
      this.updatePlayerPosition(event);
    }

    if (this.owner.byPlayer(event)) {
      this.processForMasteryEffectiveness(event);
    }
  }

  processForMasteryEffectiveness(event) {
    if (!this.lastPlayerPositionUpdate) {
      console.error('Received a heal before we know the player location. Can\'t process since player location is still unknown.', event);
      return;
    } else if (this.selectedCombatant === null) {
      console.error('Received a heal before selected combatant meta data was received.', event);
      if (process.env.NODE_ENV === 'development') {
        throw new Error('This shouldn\'t happen anymore. Save to remove after 8 march 2018.');
      }
      return;
    }
    const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.includes(event.ability.guid);

    const healingDone = event.amount;

    if (isAbilityAffectedByMastery) {
      // console.log(event.ability.name,
      //   `healing:${event.amount},distance:${distance},isRuleOfLawActive:${isRuleOfLawActive},masteryEffectiveness:${masteryEffectiveness}`,
      //   `playerMasteryPerc:${this.playerMasteryPerc}`, event);

      const distance = this.getDistanceForMastery(event);
      const isRuleOfLawActive = this.selectedCombatant.hasBuff(SPELLS.RULE_OF_LAW_TALENT.id, event.timestamp);
      // We calculate the mastery effectiveness of this *one* heal
      const masteryEffectiveness = this.constructor.calculateMasteryEffectiveness(distance, isRuleOfLawActive);

      // The base healing of the spell (excluding any healing added by mastery)
      const baseHealingDone = healingDone / (1 + this.statTracker.currentMasteryPercentage * masteryEffectiveness);
      const masteryHealingDone = healingDone - baseHealingDone;
      // The max potential mastery healing if we had a mastery effectiveness of 100% on this spell. This does NOT include the base healing
      // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
      const maxPotentialMasteryHealing = baseHealingDone * this.statTracker.currentMasteryPercentage; // * 100% mastery effectiveness

      this.masteryHealEvents.push({
        ...event,
        distance,
        masteryEffectiveness,
        baseHealingDone,
        masteryHealingDone,
        maxPotentialMasteryHealing,
      });
      // Update the event information to include the heal's mastery effectiveness in case we want to use this elsewhere (hint: StatValues)
      event.masteryEffectiveness = masteryEffectiveness;
    }
  }
  getDistanceForMastery(event) {
    return this.getPlayerDistance(event);
  }

  updatePlayerPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    this.verifyPlayerPositionUpdate(event, this.lastPlayerPositionUpdate, 'player');
    this.lastPlayerPositionUpdate = event;
  }
  verifyPlayerPositionUpdate(event, lastPositionUpdate, forWho) {
    if (!event.x || !event.y || !lastPositionUpdate) {
      return;
    }
    const distance = this.constructor.calculateDistance(lastPositionUpdate.x, lastPositionUpdate.y, event.x, event.y);
    const timeSince = event.timestamp - lastPositionUpdate.timestamp;
    const maxDistance = Math.max(1, timeSince / 1000 * 10 * 1.5); // 10 yards per second + 50% margin of error
    if (distance > maxDistance) {
      debug && console.warn(forWho, `distance since previous event (${Math.round(timeSince / 100) / 10}s ago) was ${Math.round(distance * 10) / 10} yards:`, event.type, event, lastPositionUpdate.type, lastPositionUpdate);
    }
  }

  getPlayerDistance(event) {
    return this.constructor.calculateDistance(this.lastPlayerPositionUpdate.x, this.lastPlayerPositionUpdate.y, event.x, event.y);
  }
  static calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }
  static calculateMasteryEffectiveness(distance, isRuleOfLawActive) {
    // https://docs.google.com/spreadsheets/d/1kcIuIYgn61tZoAM6nS_vzGllOuIuMxBZXunDodBTvC0/edit?usp=sharing
    const fullEffectivenessRadius = isRuleOfLawActive ? 15 : 10;
    const falloffRadius = isRuleOfLawActive ? 60 : 40;

    return Math.min(1, Math.max(0, 1 - (distance - fullEffectivenessRadius) / (falloffRadius - fullEffectivenessRadius)));
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

  get overallMasteryEffectiveness() {
    return this.report.totalHealingFromMastery / (this.report.totalMaxPotentialMasteryHealing || 1);
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(10)}
        icon={<img src={MasteryRadiusImage} style={{ border: 0 }} alt={i18n._(t`Mastery effectiveness`)} />}
        value={`${formatPercentage(this.overallMasteryEffectiveness)} %`}
        label={i18n._(t`Mastery effectiveness`)}
      />
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.overallMasteryEffectiveness,
      isLessThan: {
        minor: 0.75,
        average: 0.7,
        major: 0.6,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Trans>Your Mastery Effectiveness can be improved. Try to improve your positioning, usually by sticking with melee.</Trans>)
        .icon('inv_hammer_04')
        .actual(i18n._(t`${formatPercentage(actual)}% mastery effectiveness`))
        .recommended(i18n._(t`>${formatPercentage(recommended)}% is recommended`));
    });
  }

  tab() {
    return {
      title: i18n._(t`Mastery effectiveness`),
      url: 'mastery-effectiveness',
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
