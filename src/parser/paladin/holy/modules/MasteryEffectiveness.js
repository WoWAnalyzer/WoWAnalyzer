import React from 'react';
import { Trans, t } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import HealingValue from 'parser/shared/modules/HealingValue';
import { i18n } from 'interface/RootLocalizationProvider';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import Panel from 'interface/statistics/Panel';
import Radar from 'interface/statistics/components/DistanceRadar';
import PlayerBreakdown from 'interface/others/PlayerBreakdown';

import BeaconTargets from './beacons/BeaconTargets';
import { ABILITIES_AFFECTED_BY_MASTERY } from '../constants';
import Events from 'parser/core/Events';

const debug = false;

/**
 * Options:
 *
 * A. Get average regardless of health or amount.
 * This gets the average based on just the range per heal. This ignores the heal amount and ignores the health pool of the target. A 999 tiny heals and 1 huge heal will get a linear average based on the 1000 heals. This means the result will lean more towards the tiny heals.
 *
 * B. Get average adjusted for healing amount.
 * This gets the average based on the amount healed. This ignores the health pool of the target (and thus overhealing). A 999 tiny heals and 1 huge heal will lean more towards the huge heal.
 *
 * C. Get average adjusted for target health.
 * This gets the average based on the target's health and potential overhealing. Any overhealing is excluded for the max potential. Image you cast a heal where the mastery gain was 90 healing at 50% effectiveness (based on range). After the heal, the target only has 10 health missing. In this situation the total potential mastery gain would be considered 100. This gives you a 90% adjusted effectiveness (instead of the 50% based on range).
 *
 * D. Get average adjusted for target health and amount.
 * Combines B and C so that 100 potential mastery gain is valued much less than 1,000 potential.
 *
 * Option A might incorrectly inflate the mastery effectiveness due to certain tiny heals having high effectiveness while they might unevenly contribute to total healing. In addition other tools using this to calculate stat weights do so based on total average healing done and have no idea about tiny heals potentially having better mastery effectiveness.
 * Option C doesn't have any benefits for this statistic or outside of it. This mastery effectiveness can not be used for stat weights as stat weights already account for overhealing and it would throw off the calculation. It's also misleading for analysis for various reasons.
 * Option D suffers from the same problems as option C, but with the benefits from option B.
 * Option B is the best choice. It gets the right average both for analysis and for stat weights. It's the most natural.
 *
 * @property {Combatants} combatants
 * @property {BeaconTargets} beaconTargets
 * @property {StatTracker} statTracker
 */
class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    beaconTargets: BeaconTargets,
    statTracker: StatTracker,
  };

  _lastPlayerPositionUpdate = null;
  distanceSum = 0;
  distanceCount = 0;
  get averageDistance() {
    return this.distanceSum / this.distanceCount;
  }
  rawMasteryEffectivenessSum = 0;
  rawMasteryEffectivenessCount = 0;
  /**
   * @return {number} The mastery effectiveness based solely on your range to the target being healed. Health levels and healing amounts are not included. This means if you do 999 tiny heals and 1 big one, it still takes the average range-based mastery effectiveness of the 1000 heals.
   */
  get averageRawMasteryEffectiveness() {
    return this.rawMasteryEffectivenessSum / this.rawMasteryEffectivenessCount;
  }
  masteryEffectivenessRawMasteryGainSum = 0;
  masteryEffectivenessRawPotentialMasteryGainSum = 0;
  /**
   * @return {number} The mastery effectiveness based on your range to the target being healed and the amount healed. Smaller heals weigh less than bigger heals (linearly).
   */
  get masteryEffectivenessMasteryHealingGainAverage() {
    return (
      this.masteryEffectivenessRawMasteryGainSum /
      this.masteryEffectivenessRawPotentialMasteryGainSum
    );
  }
  /**
   * @type {number} The total amount of healing done by just the mastery gain. Precisely calculated for every spell.
   */
  totalMasteryHealingDone = 0;

  masteryHealEvents = [];

  constructor(options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER), this.onEnergize);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHealToPlayer);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHealByPlayer);
  }

  onCast(event) {
    this.updatePlayerPosition(event);
  }
  onDamageTaken(event) {
    // Damage coordinates are for the target, so they are only accurate when done TO player
    this.updatePlayerPosition(event);
  }
  onEnergize(event) {
    this.updatePlayerPosition(event);
  }
  onHealToPlayer(event) {
    // Do this before checking if this was done by player so that self-heals will apply full mastery properly
    this.updatePlayerPosition(event);
  }
  onHealByPlayer(event) {
    this.processForMasteryEffectiveness(event);
  }

  processForMasteryEffectiveness(event) {
    if (!this._lastPlayerPositionUpdate) {
      console.error(
        "Received a heal before we know the player location. Can't process since player location is still unknown.",
        event,
      );
      return;
    }
    const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.includes(event.ability.guid);
    if (!isAbilityAffectedByMastery) {
      return;
    }

    const distance = this.getPlayerDistance(event);
    const isRuleOfLawActive = this.selectedCombatant.hasBuff(
      SPELLS.RULE_OF_LAW_TALENT.id,
      event.timestamp,
    );

    this.distanceSum += distance;
    this.distanceCount += 1;

    const masteryEffectiveness = this.constructor.calculateMasteryEffectiveness(
      distance,
      isRuleOfLawActive,
    );
    // Raw is the mastery effectiveness regardless of health pool and heal amount.
    this.rawMasteryEffectivenessSum += masteryEffectiveness;
    this.rawMasteryEffectivenessCount += 1;

    const heal = new HealingValue(event.amount, event.absorbed, event.overheal);
    const applicableMasteryPercentage =
      this.statTracker.currentMasteryPercentage * masteryEffectiveness;

    // The base healing of the spell (excluding any healing added by mastery)
    const baseHealing = heal.raw / (1 + applicableMasteryPercentage);
    const rawMasteryGain = heal.raw - baseHealing;
    const actualMasteryHealingDone = Math.max(0, heal.effective - baseHealing);
    this.totalMasteryHealingDone += actualMasteryHealingDone;

    // The max potential mastery healing if we had a mastery effectiveness of 100% on this spell. This does NOT include the base healing. Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
    const maxPotentialRawMasteryHealing = baseHealing * this.statTracker.currentMasteryPercentage; // * 100% mastery effectiveness

    this.masteryEffectivenessRawMasteryGainSum += rawMasteryGain;
    this.masteryEffectivenessRawPotentialMasteryGainSum += maxPotentialRawMasteryHealing;

    this.masteryHealEvents.push({
      ...event,
      effectiveHealing: heal.effective,
      rawMasteryGain,
      maxPotentialRawMasteryHealing,
    });
    // Update the event information to include the heal's mastery effectiveness in case we want to use this elsewhere (hint: StatValues)
    event.masteryEffectiveness = masteryEffectiveness;
  }

  updatePlayerPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    this.verifyPlayerPositionUpdate(event, this._lastPlayerPositionUpdate, 'player');
    this._lastPlayerPositionUpdate = event;
  }
  verifyPlayerPositionUpdate(event, lastPositionUpdate, forWho) {
    if (!event.x || !event.y || !lastPositionUpdate) {
      return;
    }
    const distance = this.constructor.calculateDistance(
      lastPositionUpdate.x,
      lastPositionUpdate.y,
      event.x,
      event.y,
    );
    const timeSince = event.timestamp - lastPositionUpdate.timestamp;
    const maxDistance = Math.max(1, (timeSince / 1000) * 10 * 1.5); // 10 yards per second + 50% margin of error
    if (distance > maxDistance) {
      debug &&
        console.warn(
          forWho,
          `distance since previous event (${Math.round(timeSince / 100) / 10}s ago) was ${
            Math.round(distance * 10) / 10
          } yards:`,
          event.type,
          event,
          lastPositionUpdate.type,
          lastPositionUpdate,
        );
    }
  }

  getPlayerDistance(event) {
    return this.constructor.calculateDistance(
      this._lastPlayerPositionUpdate.x,
      this._lastPlayerPositionUpdate.y,
      event.x,
      event.y,
    );
  }
  static calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }
  static calculateMasteryEffectiveness(distance, isRuleOfLawActive) {
    // https://docs.google.com/spreadsheets/d/1kcIuIYgn61tZoAM6nS_vzGllOuIuMxBZXunDodBTvC0/edit?usp=sharing
    const fullEffectivenessRadius = isRuleOfLawActive ? 15 : 10;
    const falloffRadius = isRuleOfLawActive ? 60 : 40;

    return Math.min(
      1,
      Math.max(
        0,
        1 - (distance - fullEffectivenessRadius) / (falloffRadius - fullEffectivenessRadius),
      ),
    );
  }

  get report() {
    const statsByTargetId = this.masteryHealEvents.reduce((obj, event) => {
      // Update the player-totals
      if (!obj[event.targetID]) {
        const combatant = this.combatants.players[event.targetID];
        obj[event.targetID] = {
          combatant,
          effectiveHealing: 0,
          healingReceived: 0,
          healingFromMastery: 0,
          maxPotentialHealingFromMastery: 0,
        };
      }
      const playerStats = obj[event.targetID];
      playerStats.effectiveHealing += event.effectiveHealing;
      playerStats.healingReceived += event.amount;
      playerStats.healingFromMastery += event.rawMasteryGain;
      playerStats.maxPotentialHealingFromMastery += event.maxPotentialRawMasteryHealing;

      return obj;
    }, {});

    return statsByTargetId;
  }

  statistic() {
    // console.log('total mastery healing done', this.owner.formatItemHealingDone(this.totalMasteryHealingDone));

    return [
      <Statistic key="Statistic" position={STATISTIC_ORDER.CORE(10)}>
        <div className="pad" style={{ position: 'relative' }}>
          <label>
            <Trans>Mastery effectiveness</Trans>
          </label>
          <div className="value">
            {formatPercentage(this.masteryEffectivenessMasteryHealingGainAverage, 0)}%
          </div>

          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 0,
              textAlign: 'center',
            }}
          >
            <Radar
              distance={this.distanceSum / this.distanceCount}
              style={{
                display: 'inline-block',
              }}
              playerColor="#f58cba" // Paladin color
            />
            <div
              style={{
                opacity: 0.5,
                lineHeight: 1,
                marginTop: -4,
                fontSize: 13,
              }}
            >
              <Trans>Average distance</Trans>
            </div>
          </div>
        </div>
      </Statistic>,
      <Panel
        key="Panel"
        title={<Trans>Mastery effectiveness breakdown</Trans>}
        explanation={
          <Trans>
            This shows you your mastery effectiveness on each individual player and the amount of
            healing done to those players.
          </Trans>
        }
        position={200}
        pad={false}
      >
        <PlayerBreakdown report={this.report} players={this.owner.players} />
      </Panel>,
    ];
  }

  get suggestionThresholds() {
    return {
      actual: this.masteryEffectivenessMasteryHealingGainAverage,
      isLessThan: {
        minor: 0.75,
        average: 0.7,
        major: 0.6,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans>
          Your Mastery Effectiveness can be improved. Try to improve your positioning, usually by
          sticking with melee.
        </Trans>,
      )
        .icon('inv_hammer_04')
        .actual(i18n._(t`${formatPercentage(actual)}% mastery effectiveness`))
        .recommended(i18n._(t`>${formatPercentage(recommended)}% is recommended`)),
    );
  }
}

export default MasteryEffectiveness;
