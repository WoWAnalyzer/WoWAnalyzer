import React from 'react';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

const debug = false;

class IronFur extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  lastIronfurBuffApplied = 0;
  physicalHitsWithIronFur = 0;
  physicalDamageWithIronFur = 0;
  physicalHitsWithoutIronFur = 0;
  physicalDamageWithoutIronFur = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.IRONFUR.id === spellId) {
      this.lastIronfurBuffApplied = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.IRONFUR.id === spellId) {
      this.lastIronfurBuffApplied = 0;
    }
  }

  on_toPlayer_damage(event) {
    // Physical
    if (event.ability.type === 1) {
      if (this.lastIronfurBuffApplied > 0) {
        this.physicalHitsWithIronFur += 1;
        this.physicalDamageWithIronFur += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      } else {
        this.physicalHitsWithoutIronFur += 1;
        this.physicalDamageWithoutIronFur += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      }
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Hits with ironfur ${this.physicalHitsWithIronFur}`);
      console.log(`Damage with ironfur ${this.physicalDamageWithIronFur}`);
      console.log(`Hits without ironfur ${this.physicalHitsWithoutIronFur}`);
      console.log(`Damage without ironfur ${this.physicalDamageWithoutIronFur}`);
      console.log(`Total physical ${this.physicalDamageWithoutIronFur}${this.physicalDamageWithIronFur}`);
    }
  }

  suggestions(when) {
    const physicalDamageMitigatedPercent = this.physicalDamageWithIronFur / (this.physicalDamageWithIronFur + this.physicalDamageWithoutIronFur);

    when(physicalDamageMitigatedPercent).isLessThan(0.90)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You only had the <SpellLink id={SPELLS.IRONFUR.id} /> buff for {formatPercentage(actual)}% of physical damage taken. You should have the Ironfur buff up to mitigate as much physical damage as possible.</span>)
          .icon(SPELLS.IRONFUR.icon)
          .actual(`${formatPercentage(actual)}% was mitigated by Ironfur`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`)
          .regular(recommended - 0.10).major(recommended - 0.2);
      });
  }

  statistic() {
    const totalIronFurTime = this.combatants.selected.getBuffUptime(SPELLS.IRONFUR.id);
    const physicalHitsMitigatedPercent = this.physicalHitsWithIronFur / (this.physicalHitsWithIronFur + this.physicalHitsWithoutIronFur);
    const physicalDamageMitigatedPercent = this.physicalDamageWithIronFur / (this.physicalDamageWithIronFur + this.physicalDamageWithoutIronFur);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONFUR.id} />}
        value={`${formatPercentage(physicalHitsMitigatedPercent)}%`}
        label="Ironfur uptime"
        tooltip={`Ironfur usage breakdown:
            <ul>
                <li>You were hit <b>${this.physicalHitsWithIronFur}</b> times with your Ironfur buff (<b>${formatThousands(this.physicalDamageWithIronFur)}</b> damage).</li>
                <li>You were hit <b>${this.physicalHitsWithoutIronFur}</b> times <b><i>without</i></b> your Ironfur buff (<b>${formatThousands(this.physicalDamageWithoutIronFur)}</b> damage).</li>
            </ul>
            <b>${formatPercentage(physicalHitsMitigatedPercent)}%</b> of physical attacks were mitigated with Ironfur (<b>${formatPercentage(physicalDamageMitigatedPercent)}%</b> of physical damage taken), and your overall uptime was <b>${formatPercentage(totalIronFurTime / this.owner.fightDuration)}%</b>.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default IronFur;
