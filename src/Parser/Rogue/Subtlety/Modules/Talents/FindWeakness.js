import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Enemies from 'Parser/Core/Modules/Enemies';


/**
 * Find Weakness
 * Your Shadowstrike and Cheap Shot abilities reveal a flaw in your target's defenses, causing all your attacks to bypass 40%  of that enemy's armor for 10 sec.
 */
class FindWeakness extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
   
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FIND_WEAKNESS_TALENT.id);
  }

  badVanishCasts = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VANISH.id) {
      this.handleVanish(event);
    }
  }

  handleVanish(event) {
    const entities = this.enemies.getEntities();
    const hasDebuff = Object.values(entities)
      .some(enemy => enemy.getBuff(SPELLS.FIND_WEAKNESS_TALENT.Id, { sourceId: this.selectedCombatant.Id } ));

    if(hasDebuff) {
      this.badVanishCasts++;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `Use Vanish only when Find Weakness is not up.`;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.badVanishCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Use <SpellLink id={SPELLS.VANISH.id} /> only when you do not have <SpellLink id={SPELLS.FIND_WEAKNESS_TALENT.id} /> applied to your target </React.Fragment>)
        .icon(SPELLS.VANISH.icon)
        .actual(`You used Vanish ${this.badVanishCasts} times when Find Weakness was already applied`)
        .recommended(`${recommended} is recommended`);
    });
  }

  statistic() {
    const uptime = this.enemies.getBuffUptime(SPELLS.FIND_WEAKNESS_BUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FIND_WEAKNESS_TALENT.id} />}
        value={`${formatPercentage(uptime)} %`}
        label={`${SPELLS.FIND_WEAKNESS_TALENT.name} uptime`}
      />
    );  
  }
  
  statisticOrder = STATISTIC_ORDER.OPTIONAL(40);
}

export default FindWeakness;
