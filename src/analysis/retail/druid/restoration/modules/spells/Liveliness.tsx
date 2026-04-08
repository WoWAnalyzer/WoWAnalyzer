import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  LIVELINESS_INCREASED_DAMAGE_RATE,
  LIVELINESS_INCREASED_RATE,
} from 'analysis/retail/druid/restoration/constants';

const LIVELINESS_HEALING_RATE_INCREASE = 0.05;
const LIVELINESS_DAMAGE_RATE_INCREASE = 0.25;

/**
 * **Liveliness**
 * Spec Talent
 *
 * Your damage over time effects deal their damage 25% faster, and your healing over time effects heal 5% faster.
 */
export default class Liveliness extends Analyzer {
  healing = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.LIVELINESS_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(LIVELINESS_INCREASED_RATE),
      this.onHotHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(LIVELINESS_INCREASED_DAMAGE_RATE),
      this.onDamage,
    );
  }

  onHotHeal(event: HealEvent) {
    if (!event.tick) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, LIVELINESS_HEALING_RATE_INCREASE);
  }

  onDamage(event: DamageEvent) {
    if (!event.tick) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, LIVELINESS_DAMAGE_RATE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(9)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Estimated bonus DPS from faster DoT tick rate:
            <br />
            <ItemPercentDamageDone amount={this.damage} />
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.LIVELINESS_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
