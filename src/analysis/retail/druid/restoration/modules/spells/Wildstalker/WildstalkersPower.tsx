import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/druid/restoration/constants';
import Events, { HealEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const WILDSTALKERS_POWER_DAMAGE_INCREASE = 0.05;
const WILDSTALKERS_POWER_HEALING_INCREASE = 0.1;

/**
 * **Wildstalker's Power**
 * Hero Talent - Wildstalker
 *
 * Rip and Ferocious Bite damage increased by 5%.
 * Rejuvenation, Efflorescence, and Lifebloom healing increased by 10%.
 */
export default class WildstalkersPower extends Analyzer {
  healing = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.WILDSTALKERS_POWER_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.REJUVENATION,
          SPELLS.REJUVENATION_GERMINATION,
          SPELLS.EFFLORESCENCE_HEAL,
          SPELLS.LIFEBLOOM_HOT_HEAL,
          SPELLS.LIFEBLOOM_BLOOM_HEAL,
        ]),
      this.onHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.RIP, SPELLS.FEROCIOUS_BITE]),
      this.onDamage,
    );
  }

  private onHeal(event: HealEvent) {
    this.healing += calculateEffectiveHealing(event, WILDSTALKERS_POWER_HEALING_INCREASE);
  }

  private onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, WILDSTALKERS_POWER_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS_DRUID.WILDSTALKERS_POWER_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
          <br />
          <ItemPercentDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
