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

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.PARSELS_TONGUE.id);
  }

  on_byPlayer_applybuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.PARSELS_TONGUE_BUFF.id) {
      return;
    }
    this._currentStacks += 1;
  }

  on_byPlayer_applybuffstack(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.PARSELS_TONGUE_BUFF.id) {
      return;
    }
    this._currentStacks += 1;
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

  get suggestionThresholds() {
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
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You lost <SpellLink id={SPELLS.PARSELS_TONGUE_BUFF.id} icon /> buff {this.timesDropped} times, try and avoid this if possible.</Wrapper>)
        .icon(ITEMS.PARSELS_TONGUE.icon)
        .actual(`${actual} times dropped`)
        .recommended(`${recommended} is recommended`);
    });

  }
  item() {
    return {
      item: ITEMS.PARSELS_TONGUE,
      result: (
        <dfn data-tip={`You had a ${formatPercentage(this.buffUptime)}% uptime on the Parsel's Tongue buff.`}>
          <ItemDamageDone amount={this.bonusDmg} /><br />
          <ItemHealingDone amount={this.bonusHealing} />
        </dfn>
      ),
    };
  }
}

export default ParselsTongue;
