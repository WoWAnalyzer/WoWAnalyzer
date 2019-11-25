import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

const DAMAGE_BONUS = 0.2;
/*
  From the Shadows:
    Casting Call Dreadstalkers causes the target to take 20% additional Shadowflame damage from you for the next 12 sec.
 */
class FromTheShadows extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FROM_THE_SHADOWS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.DEMONBOLT, SPELLS.HAND_OF_GULDAN_DAMAGE, SPELLS.IMPLOSION_DAMAGE]), this.handleDamage);
  }

  handleDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.FROM_THE_SHADOWS_DEBUFF.id)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.FROM_THE_SHADOWS_TALENT.id} /> bonus dmg</>}
        value={this.owner.formatItemDamageDone(this.damage)}
        valueTooltip={`${formatThousands(this.damage)} bonus damage`}
      />
    );
  }
}

export default FromTheShadows;
