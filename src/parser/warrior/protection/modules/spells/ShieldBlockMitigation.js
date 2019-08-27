import React from 'react';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';

const debug = false;

//Moved from another file as it was easier to keep track of with this name
class ShieldBlockMitigation extends Analyzer {
  physicalHitsWithShieldBlock = 0;
  physicalDamageWithShieldBlock = 0;
  physicalHitsWithoutShieldBlock = 0;
  physicalDamageWithoutShieldBlock = 0;

  on_toPlayer_damage(event) {
    // Physical
    if (event.ability.type === 1) {
      if (this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
        this.physicalHitsWithShieldBlock += 1;
        this.physicalDamageWithShieldBlock += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      } else {
        this.physicalHitsWithoutShieldBlock += 1;
        this.physicalDamageWithoutShieldBlock += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      }
    }
  }

  on_fightend() {
    if (debug) {
      console.log(`Hits with Shield Block ${this.physicalHitsWithShieldBlock}`);
      console.log(`Damage with Shield Block ${this.physicalDamageWithShieldBlock}`);
      console.log(`Hits without Shield Block ${this.physicalHitsWithoutShieldBlock}`);
      console.log(`Damage without Shield Block ${this.physicalDamageWithoutShieldBlock}`);
      console.log(`Total physical ${this.physicalDamageWithoutShieldBlock}${this.physicalDamageWithShieldBlock}`);
    }
  }

  get suggestionThresholds() {//was in here before but is/was never used and appears to be very high requirements that are unreasonable maybe lower and add laster?
    return {
      actual: this.physicalDamageWithShieldBlock / (this.physicalDamageWithShieldBlock + this.physicalDamageWithoutShieldBlock),
      isLessThan: {
        minor: 0.9,
        average: 0.75,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>You only had the <SpellLink id={SPELLS.SHIELD_BLOCK_BUFF.id} /> buff for {formatPercentage(actual)}% of physical damage taken. You should have the Shield Block buff up to mitigate as much physical damage as possible.</>)
            .icon(SPELLS.SHIELD_BLOCK_BUFF.icon)
            .actual(`${formatPercentage(actual)}% was mitigated by Shield Block`)
            .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`);
        });
  }

  statistic() {
    const physicalHitsMitigatedPercent = this.physicalHitsWithShieldBlock / (this.physicalHitsWithShieldBlock + this.physicalHitsWithoutShieldBlock);
    const physicalDamageMitigatedPercent = this.physicalDamageWithShieldBlock / (this.physicalDamageWithShieldBlock + this.physicalDamageWithoutShieldBlock);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHIELD_BLOCK_BUFF.id} />}
        value={`${formatPercentage (physicalHitsMitigatedPercent)}%`}
        label="Physical Hits Mitigated"
        tooltip={(
          <>
            Shield Block usage breakdown:
            <ul>
              <li>You were hit <strong>{this.physicalHitsWithShieldBlock}</strong> times with your Shield Block buff (<strong>{formatThousands(this.physicalDamageWithShieldBlock)}</strong> damage).</li>
              <li>You were hit <strong>{this.physicalHitsWithoutShieldBlock}</strong> times <strong><em>without</em></strong> your Shield Block buff (<strong>{formatThousands(this.physicalDamageWithoutShieldBlock)}</strong> damage).</li>
            </ul>
            <strong>{formatPercentage(physicalHitsMitigatedPercent)}%</strong> of physical attacks were mitigated with Shield Block (<strong>{formatPercentage(physicalDamageMitigatedPercent)}%</strong> of physical damage taken).
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default ShieldBlockMitigation;