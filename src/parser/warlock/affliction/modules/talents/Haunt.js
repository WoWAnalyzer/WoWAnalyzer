import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatThousands, formatNumber } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import { UNSTABLE_AFFLICTION_DEBUFFS } from '../../constants';

const HAUNT_DAMAGE_BONUS = 0.1;

class Haunt extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  bonusDmg = 0;
  totalTicks = 0;
  buffedTicks = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HAUNT_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    const hasHaunt = target.hasBuff(SPELLS.HAUNT_TALENT.id, event.timestamp);

    if (UNSTABLE_AFFLICTION_DEBUFFS.some(spell => spell.id === event.ability.guid)) {
      this.totalTicks += 1;
      if (hasHaunt) {
        this.buffedTicks += 1;
      }
    }

    if (hasHaunt) {
      this.bonusDmg += calculateEffectiveDamage(event, HAUNT_DAMAGE_BONUS);
    }
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.HAUNT_TALENT.id) / this.owner.fightDuration;
  }

  get dps() {
    return this.bonusDmg / this.owner.fightDuration * 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.75,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <>
            Your <SpellLink id={SPELLS.HAUNT_TALENT.id} /> debuff uptime is too low. While it's usually not possible to get 100% uptime due to travel and cast time, you should aim for as much uptime on the debuff as possible.
          </>,
        )
          .icon(SPELLS.HAUNT_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Haunt uptime.`)
          .recommended(`> ${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const buffedTicksPercentage = (this.buffedTicks / this.totalTicks) || 1;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        size="flexible"
        tooltip={(
          <>
            {formatThousands(this.bonusDmg)} bonus damage<br />
            You buffed {formatPercentage(buffedTicksPercentage)} % of your Unstable Affliction ticks with Haunt.
          </>
        )}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.HAUNT_TALENT.id} /></label>
          <div className="flex">
            <div className="flex-main value">
              {formatPercentage(this.uptime)} % <small>uptime</small>
            </div>
          </div>
          <div className="flex">
            <div className="flex-main value">
              {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} % of total</small>
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default Haunt;
