import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Enemies from 'parser/shared/modules/Enemies';

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

  latestTs = 0;
  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.FIND_WEAKNESS_BUFF.id) {
      this.latestTs = event.timestamp;
    }
  }

  handleVanish(event) {
    const entities = this.enemies.getEntities();
    const hasDebuff = Object.values(entities)
    .filter(enemy => enemy.hasBuff(SPELLS.FIND_WEAKNESS_BUFF.id))
    .map(enemy => enemy.getBuff(SPELLS.FIND_WEAKNESS_BUFF.id).timestamp);

    //For now does not support target switching, just makes sure that enough time has passed since the last application
    if(Math.max(...hasDebuff, this.latestTs) > event.timestamp - 8000) {
      this.badVanishCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `Use Vanish only when Find Weakness is not up or is about to run out.`;
    }
  }

  get vanishThresholds() {
    return {
      actual: this.badVanishCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.vanishThresholds)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Use <SpellLink id={SPELLS.VANISH.id} /> only when you do not have <SpellLink id={SPELLS.FIND_WEAKNESS_TALENT.id} /> applied to your target </>)
        .icon(SPELLS.VANISH.icon)
        .actual(`You used Vanish ${this.badVanishCasts} times when Find Weakness was already applied`)
        .recommended(`${recommended} is recommended`);
    });
  }

  statistic() {
    const uptime = this.enemies.getBuffUptime(SPELLS.FIND_WEAKNESS_BUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(40)}
        icon={<SpellIcon id={SPELLS.FIND_WEAKNESS_TALENT.id} />}
        value={`${formatPercentage(uptime)} %`}
        label={`${SPELLS.FIND_WEAKNESS_TALENT.name} uptime`}
      />
    );
  }
}

export default FindWeakness;
