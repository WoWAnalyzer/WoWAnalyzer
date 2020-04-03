import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber, formatDuration, formatNth } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';
import SpellLink from 'common/SpellLink';

import StatIcon from 'interface/icons/PrimaryStat';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemManaGained from 'interface/ItemManaGained';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';

import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import StatTracker from 'parser/shared/modules/StatTracker';
import Haste from 'parser/shared/modules/Haste';

let OVERCHARGE_MANA_HEALING_INCREASE_PER_STACK = 0.04;
let MANA_REGEN_PER_SECOND = 800;
const OVERCHARGE_MANA_HASTE_BUFF = 0.1;
const OVERCHARGE_MANA_DURATION = 8;
const ENLIGHTENMENT_TALENT_REGEN_INCREASE = 0.1;

//https://www.warcraftlogs.com/reports/LQwKHTft4d8R36z7/#fight=3&source=8
class TheEverRisingTide extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
    buffs: Buffs,
    haste: Haste,
  };
  buffActive = false;
  stacks = 0;
  manaGained = 0;
  stat = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.EVER_RISING_TIDE.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.EVER_RISING_TIDE.traitId);
    this.stat = calculatePrimaryStat(430, 1722, this.selectedCombatant.neck.itemLevel);
    if (this.selectedCombatant.essenceRank(SPELLS.EVER_RISING_TIDE.traitId) < 2) {
      this.stat /= 0.8; // rank 2 grants 20% more stats
      OVERCHARGE_MANA_HEALING_INCREASE_PER_STACK = 0.03;
    }
    if (this.hasMajor) {
      this.abilities.add({
        spell: SPELLS.EVER_RISING_TIDE_CHARGING_BUFF,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 30,
      });
      this.buffs.add({
        spellId: SPELLS.EVER_RISING_TIDE_HEALING_BUFF.id,
        triggeredBySpellId: SPELLS.EVER_RISING_TIDE_CHARGING_BUFF.id,
        timelineHightlight: true,
      });
      if (this.selectedCombatant.hasTalent(SPELLS.ENLIGHTENMENT_TALENT.id)) {
        MANA_REGEN_PER_SECOND *= (1 + ENLIGHTENMENT_TALENT_REGEN_INCREASE);
      }
    }
    this.statTracker.add(SPELLS.EVER_RISING_TIDE_STAT_BUFF.id, {
      intellect: this.stat,
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EVER_RISING_TIDE_CHARGING_BUFF), this._cast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onHeal);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EVER_RISING_TIDE_HEALING_BUFF), this._applyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EVER_RISING_TIDE_HEALING_BUFF), this._removebuff);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.EVER_RISING_TIDE_HEALING_BUFF), this._applyBuff);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.EVER_RISING_TIDE_ENERGIZE), this._energize);
    this.addEventListener(this.haste.changehaste.by(SELECTED_PLAYER), this.hasteChange);
    this.addEventListener(Events.fightend, this._fightend);
  }

  casts = 0;
  byCast = {};
  _cast(event) {
    this.casts += 1;
    this.byCast[this.casts] = {
      timestamp: event.timestamp,
      healing: 0,
      maxStacks: 0,
    };
  }

  hasteBuffs = [];
  hasteChange(event) {
    if (event.trigger.ability && (event.trigger.ability.guid === SPELLS.EVER_RISING_TIDE_CHARGING_BUFF.id)) {
      this.hasteBuffActive = event.trigger.type === "applybuff";
      if (event.trigger.type === "removebuff") {
        this.hasteBuffs.push(event);
      }
    }
    if (this.hasteBuffActive) {
      this.hasteBuffs.push(event);
    }
  }

  _onHeal(event) {
    if (!this.buffActive) {
      return;
    }
    this.byCast[this.casts].healing += calculateEffectiveHealing(event, OVERCHARGE_MANA_HEALING_INCREASE_PER_STACK * this.stacks);
  }

  _applyBuff(event) {
    this.buffActive = true;
    this.stacks = event.stack || 1;
  }

  _removebuff(event) {
    this.byCast[this.casts].maxStacks = this.stacks;
    this.buffActive = false;
  }

  _energize(event) {
    this.manaGained += event.resourceChange;
  }

  _fightend(event) {
    if (this.buffActive) {
      this.byCast[this.casts].maxStacks = this.stacks;
    }
  }

  get manaLost() {
    return this.selectedCombatant.getBuffUptime(SPELLS.EVER_RISING_TIDE_CHARGING_BUFF.id) / 1000 * MANA_REGEN_PER_SECOND;
  }

  get minorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.EVER_RISING_TIDE_STAT_BUFF.id) / this.owner.fightDuration;
  }

  get healing() {
    return Object.values(this.byCast).reduce((acc, cast) => acc + cast.healing, 0);
  }

  //newHaste: 0.39602941176470585
  //oldHaste: 0.2691176470588235
  get majorHasteGain() {
    let averageHaste = 0;
    const hasteBuffsCopy = this.hasteBuffs.slice(0); // don't destroy the original
    while (hasteBuffsCopy.length > 0) {
      const startIndex = hasteBuffsCopy.findIndex(p => (p.trigger.ability && p.trigger.ability.guid === SPELLS.EVER_RISING_TIDE_CHARGING_BUFF.id && p.trigger.type === "applybuff"));
      const spliceCount = hasteBuffsCopy.findIndex(p => (p.trigger.ability && p.trigger.ability.guid === SPELLS.EVER_RISING_TIDE_CHARGING_BUFF.id && p.trigger.type === "removebuff")) + 1;
      if (startIndex < 0 || spliceCount <= 0) {
        break;
      }
      const ramp = hasteBuffsCopy.splice(startIndex, spliceCount);
      averageHaste = averageHaste === 0 ? this.average(ramp) : (averageHaste + this.average(ramp)) / 2;
    }
    return averageHaste * this.statTracker.hasteRatingPerPercent * this.selectedCombatant.getBuffUptime(SPELLS.EVER_RISING_TIDE_CHARGING_BUFF.id) / this.owner.fightDuration;
  }

  average(ramp) {
    let average = 0;
    let _haste = 0;
    let _lastChangeTimestamp = 0;
    ramp.forEach(_event => {
      const haste = (_event.newHaste - ((_event.newHaste - OVERCHARGE_MANA_HASTE_BUFF) / (1 + OVERCHARGE_MANA_HASTE_BUFF)));
      if (_haste) {
        if (average === 0) {
          average = _haste * ((_event.timestamp - _lastChangeTimestamp) / 1000) / OVERCHARGE_MANA_DURATION;
        } else {
          average = (average + (_haste * ((_event.timestamp - _lastChangeTimestamp) / 1000) / OVERCHARGE_MANA_DURATION) / 2);
        }
      }
      _haste = haste;
      _lastChangeTimestamp = _event.timestamp;
    });
    return average;
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.EVER_RISING_TIDE.traitId);
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic ultrawide>
          <div className="pad">
            <label><SpellLink id={SPELLS.EVER_RISING_TIDE.id} /> - Minor Rank {rank}</label>
            <div className="value">
              <StatIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.minorBuffUptime * this.stat)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small><br />
              <ItemManaGained amount={this.manaGained} />
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic
            ultrawide
            size="flexible"
            dropdown={(
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Cast</th>
                    <th>Time</th>
                    <th>Stacks</th>
                    <th>Healing</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    Object.values(this.byCast).map((cast, index) => {
                      return (
                        <tr key={index}>
                          <th>{formatNth(index + 1)}</th>
                          <td>{formatDuration((cast.timestamp - this.owner.fight.start_time) / 1000) || 0}</td>
                          <td>{cast.maxStacks}</td>
                          <td>{formatNumber(cast.healing)}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            )}>
            <div className="pad">
              <label><SpellLink id={SPELLS.EVER_RISING_TIDE_MAJOR.id} /> - Major Rank {rank}</label>
              <div className="value">
                <ItemHealingDone amount={this.healing} /><br />
                <ItemManaGained amount={this.manaLost * -1} />
                {rank > 2 && (<><StatIcon stat={"haste"} /> {formatNumber(this.majorHasteGain)} <small>average haste gained</small><br /></>)}
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export default TheEverRisingTide;
