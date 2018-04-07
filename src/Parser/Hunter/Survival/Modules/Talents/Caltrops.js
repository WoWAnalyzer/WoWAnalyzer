import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import Wrapper from 'common/Wrapper';

class Caltrops extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    enemies: Enemies,
  };

  bonusDamage = 0;
  caltropsCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CALTROPS_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CALTROPS_TALENT.id) {
      return;
    }
    this.caltropsCasts++;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CALTROPS_DAMAGE.id) {
      return;
    }
    if (this.caltropsCasts === 0) {
      this.caltropsCasts++;
      this.spellUsable.beginCooldown(SPELLS.CALTROPS_TALENT.id, this.owner.fight.start_time);
    }
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.CALTROPS_DAMAGE.id) / this.owner.fightDuration;
  }

  get uptimeThreshold() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>If you have chosen <SpellLink id={SPELLS.CALTROPS_TALENT.id} /> as a talent, you want to ensure that you have a high uptime of the DOT ticking on enemies.</Wrapper>)
        .icon(SPELLS.CALTROPS_TALENT.icon)
        .actual(`${formatPercentage(this.uptimePercentage)}%`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CALTROPS_TALENT.id} />}
        value={`${formatPercentage(this.uptimePercentage)}%`}
        label="Caltrops uptime"
      />
    );
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.CALTROPS_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.bonusDamage} />
        </div>
      </div>
    );
  }
}

export default Caltrops;
