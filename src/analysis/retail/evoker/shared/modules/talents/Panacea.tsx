import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { TALENTS_EVOKER } from 'common/TALENTS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatPercentage } from 'common/format';

class Panacea extends Analyzer {
  totalHealingReceived: number = 0;
  panaceaHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.PANACEA_TALENT);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (event.ability.guid === SPELLS.PANACEA_HEAL.id) {
      this.panaceaHealing += event.amount + (event.absorbed || 0);
    }
    this.totalHealingReceived += event.amount + (event.absorbed || 0);
  }

  statistic() {
    console.log(this.totalHealingReceived, this.panaceaHealing);
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.PANACEA_TALENT}>
          <div>
            <ItemHealingDone amount={this.panaceaHealing} />
          </div>
          {formatPercentage(this.panaceaHealing / this.totalHealingReceived)}%{' '}
          <small>of healing received</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Panacea;
