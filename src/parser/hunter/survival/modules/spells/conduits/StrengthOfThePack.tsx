import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import Events, { DamageEvent } from 'parser/core/Events';
import { STRENGTH_OF_THE_PACK_DAMAGE_MODIFIER } from 'parser/hunter/survival/constants';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';

/**
 * When Kill Command's cooldown is reset, gain 3.0% increased damage for until cancelled.
 *
 * Example log
 *
 */
class StrengthOfThePack extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;

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
    if (!this.selectedCombatant.hasBuff(SPELLS.STRENGTH_OF_THE_PACK_BUFF.id)) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(event, STRENGTH_OF_THE_PACK_DAMAGE_MODIFIER[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.STRENGTH_OF_THE_PACK_CONDUIT}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StrengthOfThePack;
