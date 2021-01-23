import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ENFEEBLED_MARK_DAMAGE_INCREASE } from 'parser/hunter/shared/constants';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Enemies from 'parser/shared/modules/Enemies';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ConduitSpellText from 'parser/ui/ConduitSpellText';

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

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id) && this.selectedCombatant.hasConduitBySpellID(SPELLS.ENFEEBLED_MARK_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.ENFEEBLED_MARK_CONDUIT.id);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET), this.onGenericDamage);
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
        <ConduitSpellText spell={SPELLS.ENFEEBLED_MARK_CONDUIT} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default EnfeebledMark;
