import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_MONK } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';

class SaveThemAll extends Analyzer {
  totalHealed: number = 0;
  totalOverhealed: number = 0;
  healingBuff: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SAVE_THEM_ALL_TALENT);
    if (!this.active) {
      return;
    }
    this.healingBuff =
      this.selectedCombatant.getTalentRank(TALENTS_MONK.SAVE_THEM_ALL_TALENT) * 0.1;
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SAVE_THEM_ALL_BUFF.id)) {
      return;
    }
    this.totalHealed += event.amount * this.healingBuff || 0;
    if (event.overheal) {
      this.totalOverhealed += event.overheal * this.healingBuff;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Total Healed: {formatNumber(this.totalHealed)} <br />
            Total Overhealed: {formatNumber(this.totalOverhealed)} <br />
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.SAVE_THEM_ALL_TALENT}>
          <ItemHealingDone amount={this.totalHealed} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SaveThemAll;
