import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatThousands } from 'common/format';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class IronSkinBrew extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  lastIronSkinBrewBuffApplied = 0;

  hitsWithIronSkinBrew = 0;
  damageWithIronSkinBrew = 0;
  hitsWithoutIronSkinBrew = 0;
  damageWithoutIronSkinBrew = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.IRONSKIN_BREW_BUFF.id === spellId) {
      this.lastIronSkinBrewBuffApplied = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.IRONSKIN_BREW_BUFF.id === spellId) {
      this.lastIronSkinBrewBuffApplied = 0;
    }
  }

  on_toPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.STAGGER_TAKEN.id) {
      if (this.lastIronSkinBrewBuffApplied > 0) {
        this.hitsWithIronSkinBrew += 1;
        this.damageWithIronSkinBrew += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      } else {
        this.hitsWithoutIronSkinBrew += 1;
        this.damageWithoutIronSkinBrew += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      }
    }
  }

  on_toPlayer_absorbed(event) {
    if (event.ability.guid === SPELLS.STAGGER.id) {
      if (this.lastIronSkinBrewBuffApplied > 0) {
        this.damageWithIronSkinBrew -= event.amount;
      } else {
        this.damageWithoutIronSkinBrew -= event.amount;
      }
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Hits with IronSkinBrew ${this.hitsWithIronSkinBrew}`);
      console.log(`Damage with IronSkinBrew ${this.damageWithIronSkinBrew}`);
      console.log(`Hits without IronSkinBrew ${this.hitsWithoutIronSkinBrew}`);
      console.log(`Damage without IronSkinBrew ${this.damageWithoutIronSkinBrew}`);
      console.log(`Total damage ${this.damageWithIronSkinBrew + this.damageWithoutIronSkinBrew + this.staggerDot}`);
    }
  }

  suggestions(when) {
    const isbUptimePercentage = this.combatants.selected.getBuffUptime(SPELLS.IRONSKIN_BREW_BUFF.id) / this.owner.fightDuration;

    when(isbUptimePercentage).isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> uptime was {formatPercentage(isbUptimePercentage)}%, unless there are extended periods of downtime it should be near 100%.</span>)
          .icon(SPELLS.IRONSKIN_BREW.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }

  statistic() {
    const isbUptime = this.combatants.selected.getBuffUptime(SPELLS.IRONSKIN_BREW_BUFF.id) / this.owner.fightDuration;
    const hitsMitigatedPercent = this.hitsWithIronSkinBrew / (this.hitsWithIronSkinBrew + this.hitsWithoutIronSkinBrew);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONSKIN_BREW.id} />}
        value={`${formatPercentage(isbUptime)}%`}
        label="Ironskin Brew uptime"
        tooltip={`Ironskin Brew breakdown (these values are direct damage and does not include damage added to stagger):
            <ul>
                <li>You were hit <b>${this.hitsWithIronSkinBrew}</b> times with your Ironskin Brew buff (<b>${formatThousands(this.damageWithIronSkinBrew)}</b> damage).</li>
                <li>You were hit <b>${this.hitsWithoutIronSkinBrew}</b> times <b><i>without</i></b> your Ironskin Brew buff (<b>${formatThousands(this.damageWithoutIronSkinBrew)}</b> damage).</li>
            </ul>
            <b>${formatPercentage(hitsMitigatedPercent)}%</b> of attacks were mitigated with Ironskin Brew.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default IronSkinBrew;
