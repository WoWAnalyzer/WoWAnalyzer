import React from 'react';

import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import ItemHealingDone from 'Main/ItemHealingDone';
import ItemDamageDone from 'Main/ItemDamageDone';
import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';

const DAMAGE_INCREASE_PER_STACK = 0.01;
const LEECH_PER_STACK = 0.02;

/*
 * Parsel's Tongue
 * Equip: Cobra Shot increases the damage done by you and your pets by 1% and your leech by 2% for 8 sec, stacking up to 4 times.
 */

class ParselsTongue extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  _currentStacks = 0;
  bonusDmg = 0;
  bonusHealing = 0;
  timesDropped = 0;
  lastApplicationTimestamp = 0;
  timesRefreshed = 0;
  accumulatedTimeBetweenRefresh = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.PARSELS_TONGUE.id);
  }

  on_byPlayer_applybuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.PARSELS_TONGUE_BUFF.id) {
      return;
    }
    this._currentStacks += 1;
    this.lastApplicationTimestamp = event.timestamp;
  }

  on_byPlayer_applybuffstack(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.PARSELS_TONGUE_BUFF.id) {
      return;
    }
    this._currentStacks += 1;
    this.timesRefreshed++;
    this.accumulatedTimeBetweenRefresh += event.timestamp - this.lastApplicationTimestamp;
    this.lastApplicationTimestamp = event.timestamp;

  }

  on_byPlayer_removebuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.PARSELS_TONGUE_BUFF.id) {
      return;
    }
    this._currentStacks = 0;
    this.timesDropped += 1;
  }

  on_byPlayer_damage(event) {
    const parselsModifier = DAMAGE_INCREASE_PER_STACK * this._currentStacks;
    if (!this.combatants.selected.hasBuff(SPELLS.PARSELS_TONGUE_BUFF.id, event.timestamp)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, parselsModifier);
  }
  on_byPlayerPet_damage(event) {
    const parselsModifier = DAMAGE_INCREASE_PER_STACK * this._currentStacks;
    if (!this.combatants.selected.hasBuff(SPELLS.PARSELS_TONGUE_BUFF.id, event.timestamp)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, parselsModifier);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LEECH.id) {
      return;
    }
    const currentLeech = this.statTracker.currentLeechPercentage;
    if (currentLeech === 0) {
      this.bonusHealing += event.amount;
    }
    else {
      const leechFromParsel = LEECH_PER_STACK * this._currentStacks;
      const leechModifier = leechFromParsel / (currentLeech + leechFromParsel);
      this.bonusHealing += getDamageBonus(event, leechModifier);
    }

  }
  get buffUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.PARSELS_TONGUE_BUFF.id) / this.owner.fightDuration;
  }

  get averageTimeBetweenRefresh() {
    return (this.accumulatedTimeBetweenRefresh / this.timesRefreshed / 1000).toFixed(2);
  }

  get timesDroppedThreshold() {
    return {
      actual: this.timesDropped,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  get buffUptimeThreshold() {
    return {
      actual: this.buffUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.timesDroppedThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You lost <SpellLink id={SPELLS.PARSELS_TONGUE_BUFF.id} /> buff {this.timesDropped} times, try and avoid this if possible.</Wrapper>)
        .icon(ITEMS.PARSELS_TONGUE.icon)
        .actual(`${actual} times dropped`)
        .recommended(`${recommended} times dropped is recommended`);
    });
    when(this.buffUptimeThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You had a low uptime of the buff from <ItemLink id={ITEMS.PARSELS_TONGUE.id} />, make sure to cast <SpellLink id={SPELLS.COBRA_SHOT.id} /> more often to ensure a better uptime of this buff. </Wrapper>)
        .icon(ITEMS.PARSELS_TONGUE.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)} is recommended`);
    });
  }
  item() {
    return {
      item: ITEMS.PARSELS_TONGUE,
      result: (
        <dfn data-tip={`You had a ${formatPercentage(this.buffUptime)}% uptime on the Parsel's Tongue buff. </br> Average time between refreshing buff was ${this.averageTimeBetweenRefresh} seconds.`}>
          <ItemDamageDone amount={this.bonusDmg} /><br />
          <ItemHealingDone amount={this.bonusHealing} />
        </dfn>
      ),
    };
  }
}

export default ParselsTongue;
