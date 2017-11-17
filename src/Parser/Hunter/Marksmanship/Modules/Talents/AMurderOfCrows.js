import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from "common/SpellIcon";
import { formatNumber, formatPercentage } from "common/format";
import SpellLink from "common/SpellLink";

//generally accepted rule is to save crows if boss is below 25% health.
const CROWS_SAVE_PERCENT = 0.25;
//when we enter execute and Bullseye starts racking up
const EXECUTE_PERCENT = 0.2;

class AMurderOfCrows extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  bossIDs = [];
  damage = 0;
  shouldHaveSaved = 0;
  bossHP = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id);
    this.owner.report.enemies.forEach(enemy => {
      enemy.fights.forEach(fight => {
        if (fight.id === this.owner.fight.id && enemy.type === "Boss") this.bossIDs.push(enemy.id);
      });
    });
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.A_MURDER_OF_CROWS_SPELL.id) {
      return;
    }
    this.damage += event.amount;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.A_MURDER_OF_CROWS_SPELL.id) {
      return;
    }
    if (event.maxHitPoints && this.bossIDs.includes(event.targetID)) {
      if ((event.hitPoints / event.maxHitPoints) <= CROWS_SAVE_PERCENT && (event.hitPoints / event.maxHitPoints) > EXECUTE_PERCENT) {
        this.shouldHaveSaved += 1;
        this.bossHP = (event.hitPoints / event.maxHitPoints);
      }
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} />}
        value={`${formatNumber(this.damage)}`}
        label={this.owner.formatItemDamageDone(this.damage)}
      />
    );
  }
  suggestions(when) {
    when(this.shouldHaveSaved).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should <b>generally</b> save <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> when the boss has under 25% hp so that it is ready to use when the boss hits 20% and you can start getting <SpellLink id={SPELLS.BULLSEYE_TRAIT.id} /> quicker.</span>)
          .icon(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.icon)
          .actual(`You cast crows while boss ${formatPercentage(this.bossHP)}% HP.`)
          .recommended(`0 casts when boss has between 20 and 25% hp is recommended`)
          .regular(recommended);
      });
  }
  statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default AMurderOfCrows;
