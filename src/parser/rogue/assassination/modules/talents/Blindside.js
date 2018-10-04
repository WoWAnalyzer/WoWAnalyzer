import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import EnemyInstances from 'parser/core/modules/EnemyInstances';
import Analyzer from 'parser/core/Analyzer';

const BLINDSIDE_EXECUTE = 0.3; 

/**
 * Exploits the vulnerability of foes with less than 30% health.
 * 
 * Mutilate has a 25% chance to make your next Blindside free and usable on any target, regardless of their health.
 */
class Blindside extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLINDSIDE_TALENT.id);
  }

  badMutilates = 0

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MUTILATE.id) {
      return;
    }
    
    //Sometimes buff event is before the cast. 
    if(this.selectedCombatant.hasBuff(SPELLS.BLINDSIDE_BUFF.id, event.timestamp - 100)) {
      this.registerBadMutilate(event, "you had a Blindside Proc");
    }    
    const target = this.enemies.getEntity(event);
    if(target && target.hpPercent < BLINDSIDE_EXECUTE) {
      this.registerBadMutilate(event, `health of your target was > ${BLINDSIDE_EXECUTE}% `);
    }
  }

  registerBadMutilate(event, reason) {
    this.badMutilates += 1;
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = `You could cast Blindside, because ${reason}`;
  }

  get suggestionThresholds() {
    return {
      actual: this.badMutilates,
      isGreaterThan: {
        minor: 0,
        average: 0.25 * this.owner.fightDuration / 1000 / 60,
        major: 0.5 * this.owner.fightDuration / 1000 / 60,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Use <SpellLink id={SPELLS.BLINDSIDE_TALENT.id} /> instead of <SpellLink id={SPELLS.MUTILATE.id} /> when the target is bellow 30% HP or when you have the <SpellLink id={SPELLS.BLINDSIDE_BUFF.id} /> proc. </>)
        .icon(SPELLS.BLINDSIDE_TALENT.icon)
        .actual(`You used Mutilate ${this.badMutilates} times when Blindside was available`)
        .recommended(`${recommended} is recommended`);
    });
  }
}

export default Blindside;
