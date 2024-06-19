import {
  ENGULF_PERIODIC_INCREASE,
  PERIODIC_DAMAGE_IDS,
  PERIODIC_HEALING_IDS,
} from 'analysis/retail/evoker/shared/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { TooltipElement } from 'interface/Tooltip';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Enemy from 'parser/core/Enemy';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class Engulf extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };
  damagePeriodicCounts: number[] = [];
  healingPeriodicCounts: number[] = [];
  totalDamage: number = 0;
  totalHealing: number = 0;
  damageFromInc: number = 0;
  healingFromInc: number = 0;
  protected combatants!: Combatants;
  protected enemies!: Enemies;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ENGULF_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ENGULF_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENGULF_HEAL), this.onHeal);
  }

  getNumPeriodicEffects(target: Combatant | Enemy) {
    const arrRef: number[] = target instanceof Enemy ? PERIODIC_DAMAGE_IDS : PERIODIC_HEALING_IDS;
    return arrRef
      .map((id) => target.hasBuff(id))
      .reduce((prev, hasBuff) => prev + (hasBuff ? 1 : 0), 0);
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const numPeriodics = this.getNumPeriodicEffects(enemy);
    this.damagePeriodicCounts.push(numPeriodics);
    this.damageFromInc += calculateEffectiveDamage(event, ENGULF_PERIODIC_INCREASE * numPeriodics);
  }

  onHeal(event: HealEvent) {
    this.totalHealing += event.amount + (event.absorbed || 0);
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }
    const numPeriodics = this.getNumPeriodicEffects(target);
    this.healingPeriodicCounts.push(numPeriodics);
    this.healingFromInc += calculateEffectiveHealing(
      event,
      ENGULF_PERIODIC_INCREASE * numPeriodics,
    );
  }

  get averageHealPeriodics() {
    return (
      this.healingPeriodicCounts.reduce((prev, cur) => prev + cur, 0) /
      (this.healingPeriodicCounts.length || 1)
    );
  }

  get averageDamagePeriodics() {
    return (
      this.damagePeriodicCounts.reduce((prev, cur) => prev + cur, 0) /
      (this.damagePeriodicCounts.length || 1)
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.ENGULF_TALENT}>
          <div>
            <TooltipElement
              content={
                <>
                  <div>Average Periodics: {this.averageHealPeriodics.toFixed(2)}</div>
                  <div>
                    % of healing from periodic increase:{' '}
                    {formatPercentage(this.healingFromInc / this.totalHealing)}%
                  </div>
                </>
              }
            >
              <ItemHealingDone amount={this.totalHealing} />
            </TooltipElement>
          </div>
          <div>
            <TooltipElement
              content={
                <>
                  <div>Average Periodics: {this.averageDamagePeriodics.toFixed(2)}</div>
                  <div>
                    % of damage from periodic increase:{' '}
                    {formatPercentage(this.damageFromInc / this.totalDamage)}%
                  </div>
                </>
              }
            >
              <ItemDamageDone amount={this.totalDamage} />
            </TooltipElement>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Engulf;
