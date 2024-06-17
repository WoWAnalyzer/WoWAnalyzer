import {
  ENGULF_PERIODIC_INCREASE,
  PERIODIC_DAMAGE_IDS,
  PERIODIC_HEALING_IDS,
} from 'analysis/retail/evoker/shared/constants';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import Combatants from 'parser/shared/modules/Combatants';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

enum PeriodicType {
  DOT,
  HOT,
}

class Engulf extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  periodicCounts: number[] = [];
  totalDamage: number = 0;
  totalHealing: number = 0;
  damageFromInc: number = 0;
  healingFromInc: number = 0;
  protected combatants!: Combatants;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ENGULF_TALENT);
  }

  onBuffApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }
    const type = event.targetIsFriendly ? PeriodicType.HOT : PeriodicType.DOT;
    this.periodicCounts.push(this.getNumPeriodicEffects(combatant, type));
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ENGULF_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ENGULF_TALENT),
      this.onHeal,
    );
  }

  getNumPeriodicEffects(target: Combatant, type: PeriodicType) {
    const arrRef: number[] = type === PeriodicType.DOT ? PERIODIC_DAMAGE_IDS : PERIODIC_HEALING_IDS;
    return arrRef
      .map((id) => target.hasBuff(id))
      .reduce((prev, hasBuff) => prev + (hasBuff ? 1 : 0), 0);
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
    if (!this.periodicCounts.length) {
      return;
    }
    this.damageFromInc += calculateEffectiveDamage(
      event,
      ENGULF_PERIODIC_INCREASE * this.periodicCounts[this.periodicCounts.length - 1],
    );
  }

  onHeal(event: HealEvent) {
    this.totalHealing += event.amount + (event.absorbed || 0);
    if (!this.periodicCounts.length) {
      return;
    }
    this.damageFromInc += calculateEffectiveHealing(
      event,
      ENGULF_PERIODIC_INCREASE * this.periodicCounts[this.periodicCounts.length - 1],
    );
  }

  get averagePeriodics() {
    return this.periodicCounts.reduce((prev, cur) => prev + cur, 0) / this.periodicCounts.length;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <div>
          <ItemHealingDone amount={this.totalHealing} />
          <ItemDamageDone amount={this.totalDamage} />
        </div>
      </Statistic>
    );
  }
}

export default Engulf;
