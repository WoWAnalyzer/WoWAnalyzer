import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';

/**
 * Piety (Oracle)
 * 20% of overhealing done is redistributed to up to 4 nearby injured allies.
 */

class Piety extends Analyzer {
  private redistributedHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PIETY_TALENT);

    if (!this.active) return;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.PIETY), this.onPietyHeal);
  }

  private onPietyHeal(event: HealEvent) {
    this.redistributedHealing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip="Healing redistributed from overhealing (20% of overheal) to nearby injured allies."
      >
        <TalentSpellText talent={TALENTS_PRIEST.PIETY_TALENT}>
          <ItemPercentHealingDone amount={this.redistributedHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Piety;
