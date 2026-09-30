import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPECS from 'game/SPECS';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { RESTORE_BALANCE_BOOST } from '../constants';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import CelestialHooks from '../../../CelestialHooks';

class RestoreBalance extends Analyzer {
  static dependencies = {
    celestialHooks: CelestialHooks,
  };
  protected celestialHooks!: CelestialHooks;
  casts = 0;
  healing = 0;
  overheal = 0;

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORE_BALANCE_TALENT);
    if (this.selectedCombatant.specId === SPECS.WINDWALKER_MONK.id) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    }
    if (this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id) {
      this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    }
  }

  private onDamage(event: DamageEvent) {
    if (this.celestialHooks.celestialActive) {
      this.damage += calculateEffectiveDamage(event, RESTORE_BALANCE_BOOST);
    }
  }

  private onHeal(event: HealEvent) {
    if (this.celestialHooks.celestialActive) {
      this.healing += calculateEffectiveHealing(event, RESTORE_BALANCE_BOOST);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS_MONK.RESTORE_BALANCE_TALENT}>
          {this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK && (
            <ItemHealingDone amount={this.healing} />
          )}
          {this.selectedCombatant.spec === SPECS.WINDWALKER_MONK && (
            <ItemDamageDone amount={this.damage} />
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RestoreBalance;
