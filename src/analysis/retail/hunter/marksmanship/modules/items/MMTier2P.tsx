import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * Arcane Shot and Multi-Shot damage increased by 20%
 */
export default class MMTier2P extends Analyzer {
  totalDamage: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW1);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_SHOT),
      this.onArcaneShotDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MULTISHOT_MM),
      this.onArcaneShotDamage,
    );
  }

  onArcaneShotDamage(event: DamageEvent) {
    this.totalDamage += event.amount + event.amount * 0.2 + (event.absorbed || 0);
  }

  onMultishotDamage(event: DamageEvent) {
    this.totalDamage += event.amount + event.amount * 0.2 + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spell={SPELLS.TWW_LIGHTLESS_2P_MM}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
