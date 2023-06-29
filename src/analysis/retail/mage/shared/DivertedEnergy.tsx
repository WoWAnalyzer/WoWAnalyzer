import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

class DivertedEnergy extends Analyzer {
  healingDone = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVERTED_ENERGY_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DIVERTED_ENERGY_HEAL),
      this.onDivertedEnergyHeal,
    );
  }

  onDivertedEnergyHeal(event: HealEvent) {
    this.healingDone += event.amount;
    if (event.overheal) {
      this.overhealing += event.overheal;
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.DIVERTED_ENERGY_TALENT.id}>
          <ItemHealingDone amount={this.healingDone} />
          <br />
          {formatNumber(this.overhealing)} <small>Overhealing</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DivertedEnergy;
