import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Interface/Others/StatisticBox';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

/**
 * Fire a shot that tears through your enemy, causing them to bleed for [(10% of Attack power) * 8 / 2] damage over 8 sec.
 * Sends your pet into a frenzy, increasing attack speed by 30% for 8 sec, stacking up to 3 times.
 *
 * Example log: https://www.warcraftlogs.com/reports/qP3Vn4rXp6ytHxzd#fight=18&type=damage-done
 */

//max stacks pet can have of the Frenzy buff
const MAX_FRENZY_STACKS = 3;

const FRENZY_DURATION = 8000;

class BarbedShot extends Analyzer {

  damage = 0;
  buffStart = 0;
  buffEnd = 0;
  currentStacks = 0;
  startOfMaxStacks = 0;
  timeAtMaxStacks = 0;
  timeBuffed = 0;
  lastBarbedShotCast = null;
  timeCalculated = null;
  lastApplicationTimestamp = 0;
  timesRefreshed = 0;
  accumulatedTimeBetweenRefresh = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT.id) {
      return;
    }
    this.lastBarbedShotCast = event.timestamp;
    if (this.currentStacks === MAX_FRENZY_STACKS) {
      this.timesRefreshed++;
      this.accumulatedTimeBetweenRefresh += event.timestamp - this.lastApplicationTimestamp;
      this.lastApplicationTimestamp = event.timestamp;
    }
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
    this.timeBuffed += event.timestamp - this.buffStart;
    if (this.currentStacks === MAX_FRENZY_STACKS) {
      this.timeAtMaxStacks += event.timestamp - this.startOfMaxStacks;
    }
    this.currentStacks = 0;
    this.timeCalculated = true;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT_PET_BUFF.id) {
      return;
    }
    if (this.currentStacks > 0) {
      this.timeBuffed += (this.lastBarbedShotCast + FRENZY_DURATION) - this.buffStart;
      if (this.currentStacks === MAX_FRENZY_STACKS) {
        this.timeAtMaxStacks += (this.lastBarbedShotCast + FRENZY_DURATION) - this.startOfMaxStacks;
      }
    }
    this.buffStart = event.timestamp;
    this.currentStacks = 1;
    this.timeCalculated = false;
    this.lastApplicationTimestamp = event.timestamp;
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT_PET_BUFF.id) {
      return;
    }
    this.currentStacks = event.stack;
    if (this.currentStacks === MAX_FRENZY_STACKS) {
      this.startOfMaxStacks = event.timestamp;
    }
    this.timesRefreshed++;
    this.accumulatedTimeBetweenRefresh += event.timestamp - this.lastApplicationTimestamp;
    this.lastApplicationTimestamp = event.timestamp;
  }

  on_finished() {
    if (!this.timeCalculated) {
      if ((this.lastBarbedShotCast + FRENZY_DURATION) > this.owner.fight.end_time) {
        if (this.currentStacks > 0) {
          this.timeBuffed += this.owner.fight.end_time - this.buffStart;
        }
        if (this.currentStacks === 3) {
          this.timeAtMaxStacks += this.owner.fight.end_time - this.startOfMaxStacks;
        }
      } else {
        if (this.currentStacks > 0) {
          this.timeBuffed += (this.lastBarbedShotCast + FRENZY_DURATION) - this.buffStart;
        }
        if (this.currentStacks === 3) {
          this.timeAtMaxStacks += (this.lastBarbedShotCast + FRENZY_DURATION) - this.startOfMaxStacks;
        }
      }
    }
  }

  get percentUptimeMaxStacks() {
    return this.timeAtMaxStacks / this.owner.fightDuration;
  }

  get percentUptimePet() {
    return this.timeBuffed / this.owner.fightDuration;
  }

  get averageTimeBetweenRefresh() {
    return (this.accumulatedTimeBetweenRefresh / this.timesRefreshed / 1000).toFixed(2);
  }

  get percentPlayerUptime() {
    //This calculates the uptime over the course of the encounter of Barbed Shot for the player
    return (this.selectedCombatant.getBuffUptime(SPELLS.BARBED_SHOT_BUFF.id)) / this.owner.fightDuration;
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

  suggestions(when) {
    when(this.direFrenzyUptimeThreshold)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your pet has a general low uptime of the buff from <SpellLink id={SPELLS.BARBED_SHOT.id} />, you should never be sitting on 2 stacks of this spells, if you've chosen this talent, it's your most important spell to continously be casting. </React.Fragment>)
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
      <StatisticBox
        position={STATISTIC_ORDER.CORE(17)}
        icon={<SpellIcon id={SPELLS.BARBED_SHOT.id} />}
        value={`${formatPercentage(this.percentUptimeMaxStacks)}%`}
        label="3 stack uptime"
        tooltip={`
        <ul>
          <li>Your pet had an overall uptime of ${formatPercentage(this.percentUptimePet)}% on the increased attack speed buff</li>
          <li>Average time between refreshing the buff was ${this.averageTimeBetweenRefresh} seconds </li>
          <li>You had an uptime of ${formatPercentage(this.percentPlayerUptime)}% on the focus regen buff.</li>
            <ul>
            </ul>
        </ul>`}
      />
    );
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.BARBED_SHOT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default BarbedShot;
