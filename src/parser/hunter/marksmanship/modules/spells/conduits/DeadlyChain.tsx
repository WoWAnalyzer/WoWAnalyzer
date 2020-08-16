import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ONE_SECOND_IN_MS } from 'parser/hunter/shared/constants';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { DEADLY_CHAIN_TRICKSHOTS_DAMAGE_INCREASE, TRICK_SHOTS_BASELINE_DAMAGE } from 'parser/hunter/marksmanship/constants';

/**
 * Trick Shots secondary damage is increased by 10.0%.
 *
 * Example log
 *
 * TODO: Verify how this applies to Trick Shots (Multiplicate or Additive)
 */
class DeadlyChain extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;
  trickShotsCastTimestamp: number = 0;
  firstHitConnected: boolean = false;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.AIMED_SHOT, SPELLS.RAPID_FIRE]), this.onTricksAffectedCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.AIMED_SHOT, SPELLS.RAPID_FIRE_DAMAGE]), this.onTricksAffectedDamage);
  }

  onTricksAffectedCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TRICK_SHOTS_BUFF.id)) {
      return;
    }
    this.trickShotsCastTimestamp = event.timestamp;
  }

  onTricksAffectedDamage(event: DamageEvent) {
    if (event.timestamp > this.trickShotsCastTimestamp + ONE_SECOND_IN_MS) {
      return;
    }
    if (!this.firstHitConnected) {
      this.firstHitConnected = true;
      return;
    }
    this.addedDamage += calculateEffectiveDamage(event, (DEADLY_CHAIN_TRICKSHOTS_DAMAGE_INCREASE[this.conduitRank] / TRICK_SHOTS_BASELINE_DAMAGE));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.DEADLY_CHAIN_CONDUIT}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeadlyChain;
