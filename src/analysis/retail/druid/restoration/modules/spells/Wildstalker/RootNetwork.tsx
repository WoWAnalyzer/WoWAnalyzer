import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/druid/restoration/constants';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';

const BONUS_PER_STACK = 0.02;

/**
 * **Soul of the Forest**
 * Hero Talent - Wildstalker
 *
 * Each active Bloodseeker Vine increases the damage your abilities deal by 2%.
 * Each active Symbiotic Bloom increases the healing of your spells by 2%.
 */
export default class RootNetwork extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.ROOT_NETWORK_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      const stacks = this.selectedCombatant.getBuffStacks(SPELLS.ROOT_NETWORK_BUFF);
      const mult = BONUS_PER_STACK * stacks;
      this.healing += calculateEffectiveHealing(event, mult);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS_DRUID.ROOT_NETWORK_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
