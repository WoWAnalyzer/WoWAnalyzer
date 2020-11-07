import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import Events, { DamageEvent } from 'parser/core/Events';
import { STRENGTH_OF_THE_PACK_DAMAGE_MODIFIER } from 'parser/hunter/survival/constants';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SPELLS from 'common/SPELLS';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';

/**
 * When Kill Command's cooldown is reset, gain 3.0% increased damage for until cancelled.
 *
 * Example log
 *
 */
class StrengthOfThePack extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.STRENGTH_OF_THE_PACK_CONDUIT.id);

    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET), this.onGenericDamage);
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
        <ConduitSpellText spell={SPELLS.STRENGTH_OF_THE_PACK_CONDUIT} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default StrengthOfThePack;
