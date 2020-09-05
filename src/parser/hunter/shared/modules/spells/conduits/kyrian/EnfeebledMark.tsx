import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { ENFEEBLED_MARK_DAMAGE_INCREASE } from 'parser/hunter/shared/constants';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Enemies from 'parser/shared/modules/Enemies';

/**
 * Your attacks and abilities deal 5.0% increased damage to enemies inside Resonating Arrow.
 *
 * Example log:
 *
 */
class EnfeebledMark extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  conduitRank: number = 0;
  addedDamage: number = 0;

  protected enemies!: Enemies;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onGenericDamage);
  }

  onGenericDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.RESONATING_ARROW_DEBUFF.id)) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(event, ENFEEBLED_MARK_DAMAGE_INCREASE[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.ENFEEBLED_MARK_CONDUIT}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EnfeebledMark;
