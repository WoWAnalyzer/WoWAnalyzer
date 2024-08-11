import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * Arcane Shot and Multi-Shot critical hits cause your next Aimed Shot to cause the target to bleed for 40% of damage dealt over 6 sec.
 */
export default class T29MMTier2P extends Analyzer {
  totalDamage: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.DF1);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HIT_THE_MARK),
      this.onHitTheMarkDamage,
    );
  }

  onHitTheMarkDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spell={SPELLS.T29_2P_BONUS_MARKSMANSHIP}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
