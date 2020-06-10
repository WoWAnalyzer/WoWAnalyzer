import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemDamageDone from 'interface/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import StatTracker from 'parser/shared/modules/StatTracker';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import UptimeIcon from 'interface/icons/Uptime';

import StatValues from '../StatValues';

const LIGHTS_DECREE_BASE_DURATION = 5;
const AVENGING_WRATH_BASE_DURATION = 20;
const AVENGING_WRATH_CRIT_BONUS = 0.3;

// this will have to be replaced when corrupted gear adds more crit damage/healing //
const CRIT_HEALING_DAMAGE = 2;
const CRIT_HEALING_BONUS = 2;

/**
 * Spending Holy Power during Avenging Wrath causes you to explode with Holy light for 508 damage per Holy Power spent to nearby enemies.
 * Avenging Wrath's duration is increased by 5 sec.
 */
class LightsDecree extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
    statValues: StatValues,
  };

  casts = 0;
  avengingWrathDuration = AVENGING_WRATH_BASE_DURATION;
  lightsDecreeDuration = LIGHTS_DECREE_BASE_DURATION;
  bonusHolyShocks = 0;

  critHeals = 0;
  bonusHealing = 0;
  bonusCritHealing = 0;

  critDamage = 0;
  bonusDamage = 0;
  bonusCritDamage = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.LIGHTS_DECREE.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_WRATH),
      this.onAvengingWrathCast,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_CAST),
      this.onHolyShock,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_HEAL),
      this.onHolyShock,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_DAMAGE),
      this.onHolyShock,
    );

    if (this.selectedCombatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT.id)) {
      this.avengingWrathDuration += this.avengingWrathDuration * 0.25;
      this.lightsDecreeDuration += this.lightsDecreeDuration * 0.25;
    }
  }

  avengingWrathBuffViaLightsDecree(event) {
    const buff = this.selectedCombatant.getBuff(SPELLS.AVENGING_WRATH.id, event.timestamp);
    if (buff === undefined) {
      return false;
    }

    if (
      event.timestamp >= buff.start + this.avengingWrathDuration * 1000 &&
      event.timestamp <
        buff.start + this.avengingWrathDuration * 1000 + this.lightsDecreeDuration * 1000
    ) {
      return true;
    }

    return false;
  }

  onAvengingWrathCast(event) {
    this.casts += 1;
    this.lastAvengingWrath = event.timestamp;
  }

  onHeal(event) {
    if (!this.avengingWrathBuffViaLightsDecree(event)) {
      return;
    }

    const healing = event.amount + (event.absorbed || 0);
    const overHeal = event.overheal || 0;
    const totalHealing = healing + overHeal;
    const extraHealing = totalHealing - totalHealing / 1.2;
    if (extraHealing > overHeal) {
      this.bonusHealing += extraHealing - overHeal;
    }

    const isCrit = event.hitType === HIT_TYPES.CRIT;
    if (!isCrit) {
      return;
    }

    this.critHeals += 1;
    const baseHeal = totalHealing / CRIT_HEALING_BONUS;
    if (overHeal > totalHealing - baseHeal) {
      return;
    }

    const { baseCritChance, ratingCritChance } = this.statValues._getCritChance(event);
    const critContribution = AVENGING_WRATH_CRIT_BONUS / (baseCritChance + ratingCritChance);
    this.bonusCritHealing += critContribution * (healing - baseHeal);
  }

  onDamage(event) {
    if (!this.avengingWrathBuffViaLightsDecree(event)) {
      return;
    }

    const damage = event.amount + (event.absorbed || 0);
    this.bonusDamage += damage - damage / 1.2;

    const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
    if (!isCrit) {
      return;
    }

    this.critDamage += 1;
    const { baseCritChance, ratingCritChance } = this.statValues._getCritChance(event);
    const critContribution = AVENGING_WRATH_CRIT_BONUS / (baseCritChance + ratingCritChance);
    this.bonusCritDamage += critContribution * (damage / CRIT_HEALING_DAMAGE);
  }

  onHolyShock(event) {
    if (this.avengingWrathBuffViaLightsDecree(event)) {
      this.bonusHolyShocks += 1;
    }
  }

  get durationIncrease() {
    return this.casts * this.lightsDecreeDuration;
  }

  get additionalUptime() {
    return this.durationIncrease / (this.owner.fightDuration / 60000);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LIGHTS_DECREE.id}
        value={
          <>
            <ItemHealingDone amount={this.bonusHealing + this.bonusCritHealing} />
            <br />
            <ItemDamageDone amount={this.bonusDamage + this.bonusCritDamage} />
            <br />
            <UptimeIcon /> {this.additionalUptime.toFixed(1)}%{' '}
            <small>uptime {this.durationIncrease} seconds</small>
            <br />
          </>
        }
        tooltip={
          <>
            You cast Avenging Wrath <b>{this.casts}</b> time(s) for{' '}
            <b>{this.durationIncrease.toFixed(1)}</b> seconds of increased duration.
            <br />
            Critical heals hit <b>{this.critHeals}</b> time(s), Avenging Wrath's 30% critical bonus
            contributed <b>+{formatNumber(this.bonusCritHealing)}</b> healing. <br />
            Critical damage hit <b>{this.critDamage}</b> time(s), Avenging Wrath's 30% critical
            bonus contributed <b>+{formatNumber(this.bonusCritDamage)}</b> damage. <br />
            20% flat healing increase from Avenging Wrath granted{' '}
            <b>+{formatNumber(this.bonusHealing)}</b> additional healing.
            <br />
            20% flat damage increase from Avenging Wrath granted{' '}
            <b>+{formatNumber(this.bonusDamage)}</b> additional damage.
            <br />
            {this.selectedCombatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT.id)
              ? `You cast ` +
                this.bonusHolyShocks +
                ` Holy Shock(s) during the 50% cooldown reduction for ` +
                (this.bonusHolyShocks / 2).toFixed(1) +
                ` extra casts.`
              : ''}
            <br />
          </>
        }
      />
    );
  }
}

export default LightsDecree;
