import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { formatDuration, formatPercentage } from 'common/format';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellUsable from 'parser/core/modules/SpellUsable';

/**
 * Fire a shot that tears through your enemy, causing them to bleed for [(10% of Attack power) * 8 / 2] damage over 8 sec.
 * Sends your pet into a frenzy, increasing attack speed by 30% for 8 sec, stacking up to 3 times.
 *
 * Example log: https://www.warcraftlogs.com/reports/qP3Vn4rXp6ytHxzd#fight=18&type=damage-done
 */

//max stacks your pet can have of the Frenzy buff
const MAX_FRENZY_STACKS = 3;

class BarbedShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  damage = 0;
  barbedShotStacks = [];
  lastBarbedShotStack = 0;
  lastBarbedShotUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.barbedShotStacks = Array.from({ length: MAX_FRENZY_STACKS + 1 }, x => []);
  }

  handleStacks(event, stack = null) {
    if (event.type === 'removebuff' || isNaN(event.stack)) { //NaN check if player is dead during on_finish
      event.stack = 0;
    }
    if (event.type === 'applybuff') {
      event.stack = 1;
    }
    if (stack) {
      event.stack = stack;
    }

    this.barbedShotStacks[this.lastBarbedShotStack].push(event.timestamp - this.lastBarbedShotUpdate);
    this.lastBarbedShotUpdate = event.timestamp;
    this.lastBarbedShotStack = event.stack;
  }

  get barbedShotTimesByStacks() {
    return this.barbedShotStacks;
  }

  getAverageBarbedShotStacks() {
    let avgStacks = 0;
    this.barbedShotStacks.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration * index;
    });
    return avgStacks.toFixed(2);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  on_toPlayerPet_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT_PET_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT_PET_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT_PET_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_finished(event) {
    this.handleStacks(event, this.lastBarbedShotStack);
  }

  get percentUptimeMaxStacks() {
    return (this.barbedShotStacks[MAX_FRENZY_STACKS].reduce((a, b) => a + b, 0)) / this.owner.fightDuration;
  }

  get percentUptimePet() {
    //this removes the time spent without the pet having the frenzy buff
    const petUptime = this.barbedShotStacks.slice(1).flatten().reduce((totalUptime, stackUptime) => totalUptime + stackUptime, 0);
    return petUptime / this.owner.fightDuration;
  }

  get percentPlayerUptime() {
    //This calculates the uptime over the course of the encounter of Barbed Shot for the player
    return this.selectedCombatant.getBuffUptime(SPELLS.BARBED_SHOT_BUFF.id) / this.owner.fightDuration;
  }

  get direFrenzyUptimeThreshold() {
    return {
      actual: this.percentUptimePet,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  get direFrenzy3StackThreshold() {
    if (this.selectedCombatant.hasTrait(SPELLS.FEEDING_FRENZY.id)) {
      return {
        actual: this.percentUptimeMaxStacks,
        isLessThan: {
          minor: 0.60,
          average: 0.55,
          major: 0.50,
        },
        style: 'percentage',
      };
    } else {
      return {
        actual: this.percentUptimeMaxStacks,
        isLessThan: {
          minor: 0.45,
          average: 0.40,
          major: 0.35,
        },
        style: 'percentage',
      };
    }
  }

  suggestions(when) {
    when(this.direFrenzyUptimeThreshold)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your pet has a general low uptime of the buff from <SpellLink id={SPELLS.BARBED_SHOT.id} />, you should never be sitting on 2 stacks of this spell, if you've chosen this talent, it's your most important spell to continously be casting. </React.Fragment>)
          .icon(SPELLS.BARBED_SHOT.icon)
          .actual(`Your pet had the buff from Barbed Shot for ${formatPercentage(actual)}% of the fight`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
    when(this.direFrenzy3StackThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Your pet has a general low uptime of the 3 stacked buff from <SpellLink id={SPELLS.BARBED_SHOT.id} />. It's important to try and maintain the buff at 3 stacks for as long as possible, this is done by spacing out your casts, but at the same time never letting them cap on charges. </React.Fragment>)
        .icon(SPELLS.BARBED_SHOT.icon)
        .actual(`Your pet had 3 stacks of the buff from Barbed Shot for ${formatPercentage(actual)}% of the fight`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <ExpandableStatisticBox
        position={STATISTIC_ORDER.CORE(17)}
        icon={<SpellIcon id={SPELLS.BARBED_SHOT.id} />}
        value={`${formatPercentage(this.percentUptimeMaxStacks)} %`}
        label="3 stack uptime"
        tooltip={`
        <ul>
          <li>Your pet had an average of ${this.getAverageBarbedShotStacks()} ${this.getAverageBarbedShotStacks() > 1 ? 'stacks' : 'stack'} active throughout the fight.</li>
          <li>Your pet had an overall uptime of ${formatPercentage(this.percentUptimePet)}% on the increased attack speed buff</li>
          <li>You had an uptime of ${formatPercentage(this.percentPlayerUptime)}% on the focus regen buff.</li>
            <ul>
            </ul>
        </ul>`}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Stacks</th>
              <th>Time (s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.barbedShotTimesByStacks).map((e, i) => (
              <tr key={i}>
                <th>{i}</th>
                <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.BARBED_SHOT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default BarbedShot;
