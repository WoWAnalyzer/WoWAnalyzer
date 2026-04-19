import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

const HARMONY_OF_THE_GROVE_HEALING_INCREASE = 0.05;

/**
 * **Harmony of the Grove**
 * Hero Talent - Keeper of the Grove
 *
 * Each of your Grove Guardians increases your healing done by 5% while active.
 */
export default class HarmonyOfTheGrove extends Analyzer {
  totalHealing = 0;
  totalStacks = 0;
  healEvents = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.HARMONY_OF_THE_GROVE_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.HARMONY_OF_THE_GROVE.id);

    this.totalStacks += stacks;
    this.healEvents += 1;

    if (stacks === 0) {
      return;
    }

    this.totalHealing += calculateEffectiveHealing(
      event,
      HARMONY_OF_THE_GROVE_HEALING_INCREASE * stacks,
    );
  }

  get avgStacks() {
    return this.healEvents === 0 ? 0 : this.totalStacks / this.healEvents;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            Average stacks while healing: <strong>{this.avgStacks.toFixed(2)}</strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.HARMONY_OF_THE_GROVE_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
