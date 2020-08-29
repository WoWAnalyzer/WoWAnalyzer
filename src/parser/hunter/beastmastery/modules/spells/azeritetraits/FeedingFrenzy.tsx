import React from 'react';
import Analyzer, {SELECTED_PLAYER, SELECTED_PLAYER_PET} from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import HIT_TYPES from 'game/HIT_TYPES';
import { calculateAzeriteEffects } from 'common/stats';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const MS = 1000;
const MS_BUFFER = 100;
const ORIGINAL_FRENZY_DURATION = 8000;

const FEEDING_FRENZY_DAMAGE_COEFFICIENT = 0.216;
const debug = false;

/**
 * Barbed Shot deals X additional damage over its duration,
 * and Frenzy's duration is increased to 9 seconds.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/1fjYdCm7JybBLagM#fight=5&type=damage-done&source=7
 */

class FeedingFrenzy extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  extraBuffUptime = 0;
  lastBSCast = 0;
  hasFrenzyUp = false;
  buffApplication = 0;
  timesExtended = 0;
  casts = 0;
  traitBonus = 0;
  traitDamageContribution = 0;
  lastAttackPower = 0;

  protected statTracker!: StatTracker;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FEEDING_FRENZY.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER_PET).spell(SPELLS.BARBED_SHOT_PET_BUFF), this.petLostFrenzy);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT_PET_BUFF), this.petGainedFrenzy);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.trackAttackPower);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT), this.onBarbedShotCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT), this.onBarbedShotDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);

    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.FEEDING_FRENZY.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.FEEDING_FRENZY.id, rank)[0], 0);
    debug && console.log(`feeding frenzy bonus from items: ${this.traitBonus}`);
  }

  extraBSUptime(timestamp: number, lastCast: number) {
    const delta = timestamp - lastCast;
    if (delta > ORIGINAL_FRENZY_DURATION) {
      this.timesExtended += 1;
      return Math.min(delta - ORIGINAL_FRENZY_DURATION, MS);
    } else {
      return 0;
    }
  }

  petLostFrenzy(event: RemoveBuffEvent) {
    this.hasFrenzyUp = false;
  }

  petGainedFrenzy(event: ApplyBuffEvent) {
    this.hasFrenzyUp = true;
    this.buffApplication = event.timestamp;
  }

  trackAttackPower(event: CastEvent) {
    if (event.attackPower !== undefined && event.attackPower > 0) {
      this.lastAttackPower = event.attackPower;
    }
  }

  onBarbedShotCast(event: CastEvent) {
    this.casts += 1;
    if (!this.hasFrenzyUp || event.timestamp < this.buffApplication + MS_BUFFER) {
      return;
    }
    this.extraBuffUptime += this.extraBSUptime(event.timestamp, this.lastBSCast);
    this.lastBSCast = event.timestamp;
  }

  onBarbedShotDamage(event: DamageEvent) {
    const [traitDamageContribution] = calculateBonusAzeriteDamage(event, [this.traitBonus], this.lastAttackPower, FEEDING_FRENZY_DAMAGE_COEFFICIENT);
    this.traitDamageContribution += traitDamageContribution;

    if (debug) {
      const critMultiplier = this.selectedCombatant.race === RACES.Tauren ? 2.04 : 2.00;
      if (event.unmitigatedAmount === undefined) {
        event.unmitigatedAmount = 1;
      }
      const externalModifier = (event.amount / event.unmitigatedAmount) / (event.hitType === HIT_TYPES.CRIT ? critMultiplier : 1.0);
      let estimatedDamage = this.traitBonus * (1 + this.statTracker.currentVersatilityPercentage);

      if (event.hitType === HIT_TYPES.CRIT) {
        estimatedDamage *= critMultiplier;
      }
      estimatedDamage *= externalModifier;
      const damageDone = event.amount + event.absorbed;
      console.log(`Damage: ${damageDone}, externalModifier: ${externalModifier.toFixed(3)}, estimatedDamage: ${estimatedDamage.toFixed(0)}, traitDamageContribution: ${traitDamageContribution.toFixed(0)}`);

      const variation = estimatedDamage / traitDamageContribution;
      console.log(`Matching of contribution calculations: ${(variation * 100).toFixed(1)}%`);
    }
  }

  onFightEnd() {
    if (this.lastBSCast !== null) {
      this.extraBuffUptime += this.extraBSUptime(this.owner.fight.end_time, this.lastBSCast);
    }
  }

  statistic() {
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(
      this.traitDamageContribution);
    const dps = this.traitDamageContribution / this.owner.fightDuration * 1000;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        tooltip={(
          <>
            This only accounts for the added uptime granted when casting Barbed Shot after 8 seconds had passed, so each cast can potentially be worth up to 1 second. <br />
            This happened a total of {this.timesExtended} {this.timesExtended > 1 ? 'times' : 'time'}.
            <ul>
              <li>This means that you gained an average extra uptime of {(this.extraBuffUptime / this.timesExtended / 1000).toFixed(2)}s per cast of Barbed Shot that was cast more than 8 seconds after the last one.</li>
              <li>Out of all your Barbed Shot casts, you gained an extra {(this.extraBuffUptime / this.casts / 1000).toFixed(2)}s of uptime per cast.</li>
            </ul>
            <br />
            The damage portion of this trait did approx. an additional {formatNumber(dps)} DPS, {formatPercentage(damageThroughputPercent)} % of your overall damage.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.FEEDING_FRENZY}>
          <>
            <UptimeIcon /> {formatNumber(this.extraBuffUptime / MS)}s <small>added Frenzy Uptime</small><br />
            {formatPercentage(damageThroughputPercent)} % / {formatNumber(dps)} DPS
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FeedingFrenzy;
