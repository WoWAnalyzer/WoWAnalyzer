import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import React from 'react';
import Events, { DamageEvent } from 'parser/core/Events';
import { RAPTOR_MONGOOSE_VARIANTS, STINGING_STRIKE_RS_MB_DMG_INCREASE } from 'parser/hunter/survival/constants';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SPELLS from 'common/SPELLS';
import ConduitSpellText from 'parser/ui/ConduitSpellText';

/**
 * Raptor Strike and Mongoose Bite damage increased by 14.0%.
 *
 * Example log
 *
 */
class StingingStrike extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.STINGING_STRIKE_CONDUIT.id);

    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS), this.onRaptorMongooseDamage);
  }

  onRaptorMongooseDamage(event: DamageEvent) {
    this.addedDamage += calculateEffectiveDamage(event, STINGING_STRIKE_RS_MB_DMG_INCREASE[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.STINGING_STRIKE_CONDUIT} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default StingingStrike;
