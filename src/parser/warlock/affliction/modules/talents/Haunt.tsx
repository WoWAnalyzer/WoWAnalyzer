import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatThousands, formatNumber } from 'common/format';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeBar from 'interface/statistics/components/UptimeBar';

import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const HAUNT_DAMAGE_BONUS = 0.1;

class Haunt extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.HAUNT_TALENT.id) / this.owner.fightDuration;
  }

  get dps() {
    return (this.bonusDmg / this.owner.fightDuration) * 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  bonusDmg = 0;
  totalTicks = 0;
  buffedTicks = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HAUNT_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }

    const hasHaunt = target.hasBuff(SPELLS.HAUNT_TALENT.id, event.timestamp);

    if (hasHaunt) {
      this.bonusDmg += calculateEffectiveDamage(event, HAUNT_DAMAGE_BONUS);
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.HAUNT_TALENT.id} /> debuff uptime is too low. While it's
          usually not possible to get 100% uptime due to travel and cast time, you should aim for as
          much uptime on the debuff as possible.
        </>,
      )
        .icon(SPELLS.HAUNT_TALENT.icon)
        .actual(
          t({
            id: 'warlock.affliction.suggestions.haunt.uptime',
            message: `${formatPercentage(actual)}% Haunt uptime.`,
          }),
        )
        .recommended(`> ${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(this.bonusDmg)} bonus damage
            <br />
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.HAUNT_TALENT}>
          {formatPercentage(this.uptime)} % <small>uptime</small>
          <br />
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.HAUNT_TALENT.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.HAUNT_TALENT.id} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)} % <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }
}

export default Haunt;
