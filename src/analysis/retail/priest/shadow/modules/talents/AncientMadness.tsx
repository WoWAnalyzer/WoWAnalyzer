import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { ApplyBuffEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamageFromCritIncrease } from 'parser/core/EventCalculateLib';
import StatTracker from 'parser/shared/modules/StatTracker';

const ANCIENT_MADNESS_CRIT_INCREASE = 0.1; //Starts by giving 10% crit
const ANCEINT_MADNESS_CRIT_DECREASE_PER_SECOND = 0.005; //Reduces by 0.5% per second
/**
 * Ranged auto-attacks have a 15% chance to increase the critical strike chance of your next Arcane Shot or Multi-Shot by 100%.
 */
class AncientMadness extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  totalDamage: number = 0;
  startTime = 0;

  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANCIENT_MADNESS_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.buffStart,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.DARK_ASCENSION_TALENT),
      this.buffStart,
    );
  }

  buffStart(event: ApplyBuffEvent) {
    this.startTime = event.timestamp;
  }

  onDamage(event: DamageEvent) {
    if (event.hitType === 2) {
      //only crit events should be sent to effectiveDamageFromCritIncrease,
      const timeSinceCast = Math.floor((event.timestamp - this.startTime) / 1000); //time since buff activation rounded to nearest second.
      const currentCritIncrease =
        ANCIENT_MADNESS_CRIT_INCREASE - timeSinceCast * ANCEINT_MADNESS_CRIT_DECREASE_PER_SECOND;
      if (currentCritIncrease > 0) {
        const effectiveDamgeFromCritIncrease = calculateEffectiveDamageFromCritIncrease(
          event,
          this.statTracker.currentCritPercentage,
          currentCritIncrease,
        );
        this.totalDamage += effectiveDamgeFromCritIncrease;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="The damage displayed is the additional damage you gained from taking this talent."
      >
        <BoringSpellValueText spell={SPELLS.ANCIENT_MADNESS_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default AncientMadness;
