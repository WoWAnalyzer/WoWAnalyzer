import React from 'react';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

const debug = false;

class Shield_Block extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  lastShield_BlockBuffApplied = 0;
  physicalHitsWithShield_Block = 0;
  physicalDamageWithShield_Block = 0;
  physicalHitsWithoutShield_Block = 0;
  physicalDamageWithoutShield_Block = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.SHIELD_BLOCK_BUFF.id === spellId) {
      this.lastShield_BlockBuffApplied = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.SHIELD_BLOCK_BUFF.id === spellId) {
      this.lastShield_BlockBuffApplied = 0;
    }
  }

  on_toPlayer_damage(event) {
    // Physical
    if (event.ability.type === 1) {
      if (this.lastShield_BlockBuffApplied > 0) {
        this.physicalHitsWithShield_Block += 1;
        this.physicalDamageWithShield_Block += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      } else {
        this.physicalHitsWithoutShield_Block += 1;
        this.physicalDamageWithoutShield_Block += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      }
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Hits with Shield Block ${this.physicalHitsWithShield_Block}`);
      console.log(`Damage with Shield Block ${this.physicalDamageWithShield_Block}`);
      console.log(`Hits without Shield Block ${this.physicalHitsWithoutShield_Block}`);
      console.log(`Damage without Shield Block ${this.physicalDamageWithoutShield_Block}`);
      console.log(`Total physical ${this.physicalDamageWithoutShield_Block}${this.physicalDamageWithShield_Block}`);
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.physicalDamageWithShield_Block / (this.physicalDamageWithShield_Block + this.physicalDamageWithoutShield_Block),
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
          return suggest(<React.Fragment>You only had the <SpellLink id={SPELLS.SHIELD_BLOCK_BUFF.id} /> buff for {formatPercentage(actual)}% of physical damage taken. You should have the Shield Block buff up to mitigate as much physical damage as possible.</React.Fragment>)
            .icon(SPELLS.SHIELD_BLOCK_BUFF.icon)
            .actual(`${formatPercentage(actual)}% was mitigated by Shield Block`)
            .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`);
        });
  }

  statistic() {
    const physicalHitsMitigatedPercent = this.physicalHitsWithShield_Block / (this.physicalHitsWithShield_Block + this.physicalHitsWithoutShield_Block);
    const physicalDamageMitigatedPercent = this.physicalDamageWithShield_Block / (this.physicalDamageWithShield_Block + this.physicalDamageWithoutShield_Block);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHIELD_BLOCK_BUFF.id} />}
        value={`${formatPercentage (physicalHitsMitigatedPercent)}%`}
        label="Physical Hits Mitigated"
        tooltip={`Shield Block usage breakdown:
            <ul>
                <li>You were hit <b>${this.physicalHitsWithShield_Block}</b> times with your Shield Block buff (<b>${formatThousands(this.physicalDamageWithShield_Block)}</b> damage).</li>
                <li>You were hit <b>${this.physicalHitsWithoutShield_Block}</b> times <b><i>without</i></b> your Shield Block buff (<b>${formatThousands(this.physicalDamageWithoutShield_Block)}</b> damage).</li>
            </ul>
            <b>${formatPercentage(physicalHitsMitigatedPercent)}%</b> of physical attacks were mitigated with Shield Block (<b>${formatPercentage(physicalDamageMitigatedPercent)}%</b> of physical damage taken).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default Shield_Block;
