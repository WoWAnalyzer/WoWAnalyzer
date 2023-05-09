import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamageFromCritIncrease } from 'parser/core/EventCalculateLib';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber } from 'common/format';
/**
 * Focusing Aim increases critical strike chance by 100%
 */
const FOCUSING_AIM_CRIT_CHANCE_INCREASE = 1;
/**
 * Ranged auto-attacks have a 15% chance to increase the critical strike chance of your next Arcane Shot or Multi-Shot by 100%.
 */
export default class T29MMTier4P extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  totalDamage: number = 0;
  totalProcs: number = 0;

  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T29);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_SHOT, SPELLS.MULTISHOT_MM]),
      this.onShotDamage,
    );
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FOCUSING_AIM), () => {
      this.totalProcs += 1;
    });
  }

  onShotDamage(event: DamageEvent) {
    if (!this.hasFocusingAim(event)) {
      return;
    }
    const effectiveDamgeFromCritIncrease = calculateEffectiveDamageFromCritIncrease(
      event,
      this.statTracker.currentCritPercentage,
      FOCUSING_AIM_CRIT_CHANCE_INCREASE,
    );

    this.totalDamage += effectiveDamgeFromCritIncrease;
  }

  private hasFocusingAim(event: DamageEvent) {
    return this.selectedCombatant.hasBuff(SPELLS.FOCUSING_AIM.id, event.timestamp);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spell={SPELLS.T29_4P_BONUS_MARKSMANSHIP}>
          <ItemDamageDone amount={this.totalDamage} />
          <br />
          {formatNumber(this.totalProcs)} <small> procs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
