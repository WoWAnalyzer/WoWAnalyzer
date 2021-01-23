import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import React from 'react';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import PreciseShots from 'parser/hunter/marksmanship/modules/spells/PreciseShots';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { POWERFUL_PRECISION_DAMAGE_INCREASE, PRECISE_SHOTS_MODIFIER } from 'parser/hunter/marksmanship/constants';
import ConduitSpellText from 'parser/ui/ConduitSpellText';

/**
 * Precise Shots increases the damage of your next Arcane Shot, Chimaera Shot or Multi-Shot by an additional x%.
 *
 * Example log
 *
 */
class PowerfulPrecision extends Analyzer {
  static dependencies = {
    preciseShots: PreciseShots,
  };

  conduitRank: number = 0;
  addedDamage: number = 0;

  protected preciseShots!: PreciseShots;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.POWERFUL_PRECISION_CONDUIT.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_SHOT, SPELLS.MULTISHOT_MM, SPELLS.CHIMAERA_SHOT_MM_FROST_DAMAGE, SPELLS.CHIMAERA_SHOT_MM_NATURE_DAMAGE]), this.onPotentialPreciseDamage);
  }

  onPotentialPreciseDamage(event: DamageEvent) {
    if (!this.preciseShots.buffedShotInFlight) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(event, (POWERFUL_PRECISION_DAMAGE_INCREASE[this.conduitRank] / PRECISE_SHOTS_MODIFIER));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.POWERFUL_PRECISION_CONDUIT} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default PowerfulPrecision;
