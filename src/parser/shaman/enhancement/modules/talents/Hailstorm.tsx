import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent, RefreshBuffEvent } from 'parser/core/Events';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import { FROSTBRAND_BUFF_DURATION_MS, FROSTBRAND_BUFF_REFRESH_THRESHOLD, FROSTBRAND_BUFF_REFRESH_THRESHOLD_MS } from '../../constants';

/**
 * Frostbrand now also enhances your weapon's damage,
 * causing each of your weapon attacks to also deal
 * (3.159% of Attack power)% Frost damage.
 *
 * Example Log: https://www.warcraftlogs.com/reports/t347bkRxBDTjYF2v#fight=3&type=damage-done&ability=-196834
 */
class Hailstorm extends Analyzer {
  protected damageGained: number = 0;
  protected casts: number = 0;
  protected earlyRefreshes: number = 0;
  protected frostbrandEndTimestamp: number = 0;

  constructor(options: any) {
    super(options);

    if (!this.selectedCombatant.hasTalent(SPELLS.HAILSTORM_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FROSTBRAND), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.FROSTBRAND, SPELLS.HAILSTORM_ATTACK]), this.onDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FROSTBRAND), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FROSTBRAND), this.onRefreshBuff);
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.frostbrandEndTimestamp = event.timestamp + FROSTBRAND_BUFF_DURATION_MS;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    const timeRemaining = this.frostbrandEndTimestamp - event.timestamp;

    if (this.frostbrandEndTimestamp - event.timestamp > FROSTBRAND_BUFF_REFRESH_THRESHOLD_MS) {
      this.earlyRefreshes += 1;
    }

    const extendedDuration = timeRemaining > FROSTBRAND_BUFF_REFRESH_THRESHOLD_MS ? FROSTBRAND_BUFF_REFRESH_THRESHOLD_MS : timeRemaining;

    this.frostbrandEndTimestamp = event.timestamp + FROSTBRAND_BUFF_DURATION_MS + extendedDuration;
  }

  get frostbrandUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FROSTBRAND.id) / this.owner.fightDuration;
  }

  get frostbrandUptimeThresholds() {
    return {
      actual: this.frostbrandUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.95,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  get frostbrandEarlyRefreshThreshold() {
    return {
      actual: this.earlyRefreshes,
      isGreaterThan: {
        minor: 0,
        average: 3,
        major: 5,
      },
      style: 'number',
    };
  }

  get refreshPercentageCast() {
    return this.earlyRefreshes / this.casts;
  }

  suggestions(when: any) {
    when(this.frostbrandUptimeThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
          return suggest(<Trans>Maintain <SpellLink id={SPELLS.FROSTBRAND.id} /> as long as possible. You can refresh this as early as {FROSTBRAND_BUFF_REFRESH_THRESHOLD} seconds remaining on the buff.</Trans>)
            .icon(SPELLS.FROSTBRAND.icon)
            .actual(<Trans>{formatPercentage(actual)}% uptime</Trans>)
            .recommended(<Trans>{formatPercentage(recommended, 0)}% is recommended</Trans>);
        },
      );

    when(this.frostbrandEarlyRefreshThreshold)
      .addSuggestion(
        (suggest: any, actual: any, recommended: any) => {
          return suggest(<Trans>Avoid refreshing <SpellLink id={SPELLS.FROSTBRAND.id} /> too early. You can optimally refresh it with less than {FROSTBRAND_BUFF_REFRESH_THRESHOLD} seconds remaining on the buff.</Trans>)
            .icon(SPELLS.FROSTBRAND.icon)
            .actual(<Trans>{actual} of {this.casts} ({formatPercentage(this.refreshPercentageCast, 0)}%) early refreshes</Trans>)
            .recommended(<Trans>{recommended} recommended</Trans>);
        },
      );
  }

  statistic() {
    return (
      <Statistic
        category="TALENTS"
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.FROSTBRAND}>
          <>
            <ItemDamageDone amount={this.damageGained} /><br />
            <UptimeIcon /> {formatPercentage(this.frostbrandUptime, 2)}% <small>buff uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Hailstorm;
