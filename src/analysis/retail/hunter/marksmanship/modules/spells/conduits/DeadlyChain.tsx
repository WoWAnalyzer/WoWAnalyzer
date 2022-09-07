import {
  DEADLY_CHAIN_TRICKSHOTS_DAMAGE_INCREASE,
  TRICK_SHOTS_BASELINE_DAMAGE,
} from 'analysis/retail/hunter/marksmanship/constants';
import { ONE_SECOND_IN_MS } from 'analysis/retail/hunter/shared';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Trick Shots secondary damage is increased by 10.0%.
 *
 * Example log
 *
 */
class DeadlyChain extends Analyzer {
  conduitRank: number = 0;
  addedDamage: number = 0;
  trickShotsCastTimestamp: number = 0;
  firstHitConnected: boolean = false;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.DEADLY_CHAIN_CONDUIT.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.AIMED_SHOT, SPELLS.RAPID_FIRE]),
      this.onTricksAffectedCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.AIMED_SHOT, SPELLS.RAPID_FIRE_DAMAGE]),
      this.onTricksAffectedDamage,
    );
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
    this.addedDamage += calculateEffectiveDamage(
      event,
      DEADLY_CHAIN_TRICKSHOTS_DAMAGE_INCREASE[this.conduitRank] / TRICK_SHOTS_BASELINE_DAMAGE,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.DEADLY_CHAIN_CONDUIT.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default DeadlyChain;
