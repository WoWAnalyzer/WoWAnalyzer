import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { TALENTS_PRIEST } from 'common/TALENTS';
import { HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../../constants';

const RESONANT_ENERGY_ID = 453846;
const RESONANT_ENERGY_AMP_PER_STACK = 0.02;

/**
 * **Resonant Energy**
 * Allies healed by your Halo receive 2% increased healing from you for 8 sec, stacking up to 5 times.
 */
class PerfectedFormHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  /** Total Healing From Resonant Energy */
  resonantEnergyHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.RESONANT_ENERGY_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.onResonantEnergyHeal,
    );
  }

  onResonantEnergyHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);

    if (target === null) {
      return;
    }

    const resonantEnergyStacks = this.selectedCombatant.getBuffStacks(
      RESONANT_ENERGY_ID,
      null,
      0,
      0,
      this.selectedCombatant.id,
    );
    this.resonantEnergyHealing += calculateEffectiveHealing(
      event,
      RESONANT_ENERGY_AMP_PER_STACK * resonantEnergyStacks,
    );
  }

  get totalHealing(): number {
    return this.resonantEnergyHealing;
  }

  get percentHealing(): number {
    return this.owner.getPercentageOfTotalHealingDone(this.totalHealing);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Total healing from Resonant Energy -{' '}
            <strong>
              {formatPercentage(
                this.owner.getPercentageOfTotalHealingDone(this.resonantEnergyHealing),
              )}
              %
            </strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.RESONANT_ENERGY_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PerfectedFormHoly;
