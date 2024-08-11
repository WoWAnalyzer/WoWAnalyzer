import { RED_HOT_INCREASE } from 'analysis/retail/evoker/shared/constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class RedHot extends Analyzer {
  totalDamage: number = 0;
  totalHealing: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.RED_HOT_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ENGULF_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENGULF_HEAL), this.onHeal);
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += calculateEffectiveDamage(event, RED_HOT_INCREASE);
  }

  onHeal(event: HealEvent) {
    this.totalHealing += calculateEffectiveHealing(event, RED_HOT_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.RED_HOT_TALENT}>
          <div>
            <ItemHealingDone amount={this.totalHealing} />
          </div>
          <div>
            <ItemDamageDone amount={this.totalDamage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RedHot;
