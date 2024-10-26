import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { DamageEvent } from 'parser/core/Events';
import {
  rendDamageEvents,
  deepWoundsDamageEvents,
} from '../../normalizers/SkullsplitterExpiredDots';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import BoringValueText from 'parser/ui/BoringValueText';

/**
 * Bash an enemy's skull, dealing [ 84% of Attack Power ] Physical damage.
 */

class Skullsplitter extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  private usesTideOfBlood = false;

  private totalDotDamageDone = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SKULLSPLITTER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SKULLSPLITTER_TALENT),
      this.onSkullSplitterDamage,
    );
  }

  private sumUpDamage(events: DamageEvent[]): number {
    if (events.length === 0) {
      return 0;
    }
    let sum = 0;
    events.forEach((event) => (sum += event.amount + (event.absorb || 0)));
    return sum;
  }

  private onSkullSplitterDamage(event: DamageEvent) {
    this.totalDotDamageDone += 1;
    this.totalDotDamageDone += this.sumUpDamage(deepWoundsDamageEvents(event));
    this.totalDotDamageDone += this.sumUpDamage(rendDamageEvents(event));
  }

  statistic() {
    const Skullsplitter = this.abilityTracker.getAbility(TALENTS.SKULLSPLITTER_TALENT.id);
    const total = Skullsplitter.damageVal.effective;
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(6)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.SKULLSPLITTER_TALENT} /> damage
            </>
          }
        >
          <>
            {formatNumber(total)} <small>direct damage</small> <br />
            {formatNumber(this.totalDotDamageDone)} <small>from expired bleeds</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default Skullsplitter;
