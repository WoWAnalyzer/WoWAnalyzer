import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatThousands } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const debug = false;

class IronSkinBrew extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  }

  lastIronSkinBrewBuffApplied = 0;

  hitsWithIronSkinBrew = 0;
  damageWithIronSkinBrew = 0;
  hitsWithoutIronSkinBrew = 0;
  damageWithoutIronSkinBrew = 0;

  // duration tracking to record clipping of buff
  _lastDurationCheck = 0;
  totalDuration = 0;
  durationLost = 0;
  _currentDuration = 0;
  _durationPerCast = 6000; // base
  _durationPerPurify = 0;
  _durationCap = -1;

  // reduces the cooldown of ISB in SpellUsable, returning the amount by
  // which the CD was reduced (0 if it was not on cooldown)
  //
  // TODO: where to put this?
  reduceCooldown(amount) {
    if(this.spellUsable.isOnCooldown(SPELLS.BLACK_OX_BREW_TALENT.id)) {
      this.spellUsable.reduceCooldown(SPELLS.BLACK_OX_BREW_TALENT.id, amount);
    }
    if(!this.spellUsable.isOnCooldown(SPELLS.IRONSKIN_BREW.id)) {
      return 0;
    }
    return this.spellUsable.reduceCooldown(SPELLS.IRONSKIN_BREW.id, amount);
  }

  on_initialized() {
    this._durationPerCast += 500 * this.combatants.selected.traitsBySpellId[SPELLS.POTENT_KICK.id];
    this._durationCap = 3 * this._durationPerCast;
    this._durationPerPurify = 1000 * this.combatants.selected.traitsBySpellId[SPELLS.QUICK_SIP.id];
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.IRONSKIN_BREW.id || SPELLS.PURIFYING_BREW.id === spellId) {
      // determine the current duration on ISB
      if (this._currentDuration > 0) {
        this._currentDuration -= event.timestamp - this._lastDurationCheck;
        this._currentDuration = Math.max(this._currentDuration, 0);
      }
      // add the duration from this buff application (?)
      let addedDuration = 0;
      if (spellId === SPELLS.IRONSKIN_BREW.id) {
        addedDuration = this._durationPerCast;
      } else if (spellId === SPELLS.PURIFYING_BREW.id) {
        addedDuration = this._durationPerPurify;
      }
      this._currentDuration += addedDuration;
      if (this._currentDuration > this._durationCap) {
        this.durationLost += this._currentDuration - this._durationCap;
        this._currentDuration = this._durationCap;
      }
      // add this duration to the total duration
      this.totalDuration += addedDuration;
      this._lastDurationCheck = event.timestamp;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.IRONSKIN_BREW_BUFF.id) {
      this.lastIronSkinBrewBuffApplied = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.IRONSKIN_BREW_BUFF.id) {
      this.lastIronSkinBrewBuffApplied = 0;
      this._currentDuration = 0;
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

  get uptimeSuggestionThreshold() {
    return {
      actual: this.hitsWithIronSkinBrew / (this.hitsWithIronSkinBrew + this.hitsWithoutIronSkinBrew),
      isLessThan: {
        minor: 0.99,
        average: 0.98,
        major: 0.95,
      },
      style: 'percentage',
    };
  }

  get clipSuggestionThreshold() {
    return {
      actual: this.durationLost / this.totalDuration,
      isGreaterThan: {
        minor: 0.02,
        average: 0.05,
        major: 0.1,
      },
      style: 'percentage',
    };
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
