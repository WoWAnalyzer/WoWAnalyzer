import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import Events from 'parser/core/Events';

import { CHI_SPENDERS } from '../../constants';

class LastEmperorsCapacitor extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  totalStacks = 0;
  currentStacks = 0;
  stacksUsed = 0;
  stacksWasted = 0;
  damage = 0;
  buffedCast = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.LAST_EMPERORS_CAPACITOR.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LAST_EMPERORS_CAPACITOR_BUFF), this.applyBuff);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LAST_EMPERORS_CAPACITOR_BUFF), this.applyBuffStack);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(CHI_SPENDERS), this.castChiSpender);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING), this.castCracklingJadeLightning);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING), this.cracklingJadeLightningDamage);
  }

  applyBuff() {
    this.totalStacks += 1;
    this.currentStacks += 1;
  }

  applyBuffStack() {
    this.totalStacks += 1;
    this.currentStacks += 1;
   }

  castChiSpender() {
    if (this.currentStacks === 20) {
      this.stacksWasted += 1;
    }
  }

  castCracklingJadeLightning() {
    if (this.currentStacks > 0) {
      this.buffedCast = true;
      this.stacksUsed += this.currentStacks;
      this.currentStacks = 0;
    }
  }

  cracklingJadeLightningDamage(event) {
    if (this.buffedCast) {
      this.damage += event.amount + (event.absorbed || 0);
      this.buffedCast = false;
    }
  }

  get averageStacksUsed() {
    return this.stacksUsed / this.abilityTracker.getAbility(SPELLS.CRACKLING_JADE_LIGHTNING.id).casts;
  }

  get stacksWastedPerMinute() {
    return this.stacksWasted / this.owner.fightDuration * 1000 / 60;
  }

  get averageStacksSuggestionThresholds() {
    return {
      actual: this.averageStacksUsed,
      isLessThan: {
        minor: 18,
        average: 16,
        major: 14,
      },
      style: 'number',
    };
  }

  get wastedStacksSuggestionsThresholds() {
    return {
      actual: this.stacksWastedPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 4,
      },
      style: 'number',
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>Damage dealt does not account for opportunity cost
            <br/>
            Stacks generated <b>{this.totalStacks}</b>
            <br/>
            Stacks consumed: <b>{this.stacksUsed}</b>
            <br/>
            Stacks wasted by generating at cap: <b>{this.stacksWasted}</b>
            <br/>
            Average stacks spent on each cast: <b>{this.averageStacksUsed.toFixed(2)}</b></>}
      >
        <BoringSpellValueText spell={SPELLS.LAST_EMPERORS_CAPACITOR}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when) {
    when(this.wastedStacksSuggestionsThresholds).addSuggestion((suggest, actual, recommended) => {
      suggest(<span> You wasted your <SpellLink id={SPELLS.THE_EMPERORS_CAPACITOR_STACK.id}/> stacks by using chi spenders while at 20 stacks </span>)
        .icon(ITEMS.THE_EMPERORS_CAPACITOR.icon)
        .actual(`${actual.toFixed(2)} Wasted stacks per minute`)
        .recommended(`${(recommended)} Wasted stacks per minute is recommended`)
    });
    when(this.averageStacksSuggestionThresholds).addSuggestion((suggest, actual) => {
      suggest(<span> Your average number of <SpellLink id={SPELLS.THE_EMPERORS_CAPACITOR_STACK.id} /> stacks used when you cast <SpellLink id={SPELLS.CRACKLING_JADE_LIGHTNING.id}/> was low </span>)
          .icon(ITEMS.THE_EMPERORS_CAPACITOR.icon)
          .actual(`${actual.toFixed(2)} average stacks used`)
          .recommended(`Try to cast Crackling Jade Lightning while as close to 20 stacks as possible`);
      });
  }
}

export default LastEmperorsCapacitor;
