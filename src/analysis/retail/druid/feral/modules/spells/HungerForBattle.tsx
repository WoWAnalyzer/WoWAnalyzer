import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { Icon, SpellLink } from 'interface';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

const BOOST_PER_STACK = 0.05;

/**
 * **Hunger for Battle**
 * Spec Talent
 *
 * When an enemy afflicted by your Rip dies, gain 10 Energy and your damage dealt is increased by
 * 5% for 8 sec, stacking up to 5 times.
 */
class HungerForBattle extends Analyzer {
  damage = 0;
  procCount = 0;
  energyGained = 0;
  energyWasted = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.HUNGER_FOR_BATTLE_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.HUNGER_FOR_BATTLE_ENERGIZE),
      this.onEnergize,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onEnergize(event: ResourceChangeEvent) {
    this.procCount += 1;
    this.energyGained += event.resourceChange - event.waste;
    this.energyWasted += event.waste;
  }

  onDamage(event: DamageEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.HUNGER_FOR_BATTLE_BUFF.id);
    if (stacks <= 0) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, stacks * BOOST_PER_STACK);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Bonus damage and energy from{' '}
            <SpellLink spell={TALENTS_DRUID.HUNGER_FOR_BATTLE_TALENT} />, triggered when an enemy
            with your <SpellLink spell={SPELLS.RIP} /> dies. Damage is attributed at 5% per stack
            while the buff is up.
            <ul>
              <li>
                Procs: <strong>{this.procCount}</strong>
              </li>
              <li>
                Energy gained: <strong>{this.energyGained}</strong>
              </li>
              <li>
                Energy wasted (overcapped): <strong>{this.energyWasted}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.HUNGER_FOR_BATTLE_TALENT}>
          <div>
            <ItemPercentDamageDone amount={this.damage} />
          </div>
          <div>
            <Icon icon="spell_shadow_shadowworddominate" />{' '}
            {this.owner.getPerMinute(this.energyGained).toFixed(1)} <small>energy per minute</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HungerForBattle;
