import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import getDamageBonus from 'parser/monk/brewmaster/modules/core/GetDamageBonus';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

const BONUS_PER_STACK = 0.03;

class ShadowEmbrace extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHADOW_EMBRACE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const shadowEmbrace = enemy.getBuff(SPELLS.SHADOW_EMBRACE_DEBUFF.id);
    if (!shadowEmbrace) {
      return;
    }
    this.damage += getDamageBonus(event, shadowEmbrace.stacks * BONUS_PER_STACK);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.SHADOW_EMBRACE_TALENT.id} /> bonus damage</>}
        value={formatThousands(this.damage)}
        valueTooltip={this.owner.formatItemDamageDone(this.damage)}
      />
    );
  }
}

export default ShadowEmbrace;
