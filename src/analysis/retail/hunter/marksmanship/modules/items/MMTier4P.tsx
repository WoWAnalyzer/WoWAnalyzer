import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { TALENTS_HUNTER } from 'common/TALENTS';

/**
 * Consuming Precise Shot increases the damage of your next Aimed Shot by 20%
 */
export default class MMTier4P extends Analyzer {
  totalDamage: number = 0;
  buffNextAimedShot = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.TWW1);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS),
      this.onPreciseShotConsumed,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.AIMED_SHOT_TALENT),
      this.onAimedShotDamage,
    );
  }

  // Increase Aimed Shot damage if precise shot buff was consumed
  onAimedShotDamage(event: DamageEvent) {
    if (this.buffNextAimedShot) {
      this.totalDamage += event.amount + event.amount * 0.2 + (event.absorbed || 0);
      this.buffNextAimedShot = false;
    }
  }

  //On Consumption of this buff, increase damage of next aimed shot
  onPreciseShotConsumed() {
    this.buffNextAimedShot = true;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spell={SPELLS.TWW_LIGHTLESS_4P_MM}>
          <ItemDamageDone amount={this.totalDamage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
