import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

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

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} bonus damage`}
      >
        <BoringSpellValueText spell={SPELLS.FROM_THE_SHADOWS_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FromTheShadows;
