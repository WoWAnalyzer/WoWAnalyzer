import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const RAKE_DAMAGE_BONUS = 0.3;

/**
 * **Infected Wounds**
 * Spec Talent
 *
 * Your Rake, Shred, and Thrash leave wounds that slow the target's movement by 50% for 12 sec.
 * Rake damage is increased by 30%.
 */
export default class InfectedWounds extends Analyzer {
  /** Damage added by the 30% Rake bonus */
  rakeDirectDamage = 0;
  rakeBleedDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.INFECTED_WOUNDS_FERAL_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAKE), this.onRakeDirect);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED),
      this.onRakeBleed,
    );
  }

  onRakeDirect(event: DamageEvent) {
    this.rakeDirectDamage += calculateEffectiveDamage(event, RAKE_DAMAGE_BONUS);
  }

  onRakeBleed(event: DamageEvent) {
    this.rakeBleedDamage += calculateEffectiveDamage(event, RAKE_DAMAGE_BONUS);
  }

  get totalDamage() {
    return this.rakeDirectDamage + this.rakeBleedDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(9)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Damage attributable to the 30% <strong>Rake</strong> bonus from Infected Wounds.
            <ul>
              <li>
                Direct hits:{' '}
                <strong>{this.owner.formatItemDamageDone(this.rakeDirectDamage)}</strong>
              </li>
              <li>
                Bleed ticks:{' '}
                <strong>{this.owner.formatItemDamageDone(this.rakeBleedDamage)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.INFECTED_WOUNDS_FERAL_TALENT}>
          <ItemPercentDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
