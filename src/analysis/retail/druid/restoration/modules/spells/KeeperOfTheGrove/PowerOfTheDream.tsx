import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';

const DREAM_SURGE_TOTAL_TARGETS = 4;

/**
 * **Power of the Dream**
 * Hero Talent - Keeper of the Grove
 *
 * Dream Surge heals 1 additional ally.
 *
 * Attributes 1/4 of Dream Bloom healing (the extra target). The base 3/4 is counted
 * under Dream Surge in the hero-tree total.
 */
export default class PowerOfTheDream extends Analyzer {
  totalHealing = 0;
  totalOverhealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.POWER_OF_THE_DREAM_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DREAM_BLOOM),
      this.onDreamBloomHeal,
    );
  }

  onDreamBloomHeal(event: HealEvent) {
    const effectiveHeal = event.amount + (event.absorbed || 0);
    this.totalHealing += effectiveHeal / DREAM_SURGE_TOTAL_TARGETS;
    this.totalOverhealing += (event.overheal || 0) / DREAM_SURGE_TOTAL_TARGETS;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <strong>
            Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
          </strong>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.POWER_OF_THE_DREAM_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
