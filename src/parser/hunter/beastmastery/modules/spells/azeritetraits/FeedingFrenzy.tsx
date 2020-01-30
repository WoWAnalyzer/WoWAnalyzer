import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import calculateBonusAzeriteDamage
  from 'parser/core/calculateBonusAzeriteDamage';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import HIT_TYPES from 'game/HIT_TYPES';
import { calculateAzeriteEffects } from 'common/stats';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
} from '../../../../../core/Events';
import Statistic from '../../../../../../interface/statistics/Statistic';

const MS = 1000;
const MS_BUFFER = 100;
const ORIGINAL_FRENZY_DURATION = 8000;

const FEEDING_FRENZY_DAMAGE_COEFFICIENT = 0.1;
const debug = false;

/**
 * Barbed Shot deals X additional damage over its duration,
 * and Frenzy's duration is increased to 9 seconds.
 *
 * Example report:
 * https://www.warcraftlogs.com/reports/9mWQv1XZJT8M6GBV#fight=1&type=damage-done
 */

class FeedingFrenzy extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  extraBuffUptime = 0;
  lastBSCast = 0;
  hasFrenzyUp = false;
  buffApplication = 0;
  timesExtended = 0;
  casts = 0;

  traitBonus = 0;
  traitDamageContribution = 0;
  lastAttackPower = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FEEDING_FRENZY.id);

    if (!this.active) {
      return;
    }

    this.traitBonus
      = this.selectedCombatant.traitsBySpellId[SPELLS.FEEDING_FRENZY.id]
      .reduce((sum, rank) => sum +
        calculateAzeriteEffects(SPELLS.FEEDING_FRENZY.id, rank)[0], 0);

    debug && console.log(`feeding frenzy bonus from items: ${this.traitBonus}`);
  }

  extraBSUptime(timestamp: number, lastCast: number) {
    const delta = timestamp - lastCast;
    if (delta >
      (
        ORIGINAL_FRENZY_DURATION
      )) {
      const ret = Math.min(delta -
        (
          ORIGINAL_FRENZY_DURATION
        ), MS);
      this.timesExtended += 1;
      return ret;
    } else {
      return 0;
    }
  }
  on_toPlayerPet_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT_PET_BUFF.id) {
      return;
    }
    this.hasFrenzyUp = false;
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT_PET_BUFF.id) {
      return;
    }
    this.hasFrenzyUp = true;
    this.buffApplication = event.timestamp;
  }

  on_byPlayer_cast(event: CastEvent) {
    if (event.attackPower !== undefined && event.attackPower > 0) {
      this.lastAttackPower = event.attackPower;
    }

    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT.id) {
      return;
    }
    this.casts++;
    if (!this.hasFrenzyUp ||
      event.timestamp <
      this.buffApplication +
      MS_BUFFER) {
      return;
    }
    this.extraBuffUptime += this.extraBSUptime(
      event.timestamp,
      this.lastBSCast,
    );
    this.lastBSCast = event.timestamp;
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT.id) {
      return;
    }

    const [traitDamageContribution] = calculateBonusAzeriteDamage(
      event,
      [this.traitBonus],
      this.lastAttackPower,
      FEEDING_FRENZY_DAMAGE_COEFFICIENT,
    );
    this.traitDamageContribution += traitDamageContribution;

    if (debug) {
      const critMultiplier = this.selectedCombatant.race === RACES.Tauren
        ? 2.04
        : 2.00;
      if (event.unmitigatedAmount === undefined) {
        event.unmitigatedAmount = 1;
      }
      const externalModifier = (
          event.amount / event.unmitigatedAmount
        ) /
        (
          event.hitType === HIT_TYPES.CRIT ? critMultiplier : 1.0
        );

      let estimatedDamage = this.traitBonus *
        (
          1 + this.statTracker.currentVersatilityPercentage
        );

      if (event.hitType === HIT_TYPES.CRIT) {
        estimatedDamage *= critMultiplier;
      }
      estimatedDamage *= externalModifier;
      const damageDone = event.amount + event.absorbed;
      console.log(`Damage: ${damageDone}, externalModifier: ${externalModifier.toFixed(
        3)}, estimatedDamage: ${estimatedDamage.toFixed(0)}, traitDamageContribution: ${traitDamageContribution.toFixed(
        0)}`);

      const variation = estimatedDamage / traitDamageContribution;
      console.log(`Matching of contribution calculations: ${(
        variation * 100
      ).toFixed(1)}%`);
    }
  }

  on_fightend() {
    if (this.lastBSCast !== null) {
      this.extraBuffUptime += this.extraBSUptime(
        this.owner.fight.end_time,
        this.lastBSCast,
      );
    }
  }
  statistic() {
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(
      this.traitDamageContribution);
    const dps = this.traitDamageContribution / this.owner.fightDuration * 1000;
    return (
      <Statistic
        size="flexible"
        category={'AZERITE_POWERS'}
        tooltip={(
          <>
            This only accounts for the added uptime granted when casting Barbed Shot after 8 seconds had passed, so each cast can potentially be worth up to 1 second. <br />
            This happened a total of {this.timesExtended} {this.timesExtended >
          1 ? 'times' : 'time'}.
            <ul>
              <li>This means that you gained an average extra uptime of {(
                this.extraBuffUptime / this.timesExtended / 1000
              ).toFixed(2)}s per cast of Barbed Shot that was cast more than 8 seconds after the last one.
              </li>
              <li>Out of all your Barbed Shot casts, you gained an extra {(
                this.extraBuffUptime / this.casts / 1000
              ).toFixed(2)}s of uptime per cast.
              </li>
            </ul>
            <br />
            The damage portion of this trait did an additional ~ {formatNumber(
            dps)} DPS, {formatPercentage(damageThroughputPercent)} % of your overall damage.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.FEEDING_FRENZY}>
          <>
            <UptimeIcon /> {formatNumber(this.extraBuffUptime /
            MS)}s <small>added Frenzy Uptime</small> <br />
            {formatPercentage(damageThroughputPercent)} % / {formatNumber(dps)} DPS
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FeedingFrenzy;
