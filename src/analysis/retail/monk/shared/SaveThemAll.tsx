import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_MONK } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

const BUFF_PER_POINT = 0.1;

class SaveThemAll extends Analyzer {
  totalHealed: number = 0;
  healingBuff: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SAVE_THEM_ALL_TALENT);
    if (!this.active) {
      return;
    }
    this.healingBuff =
      this.selectedCombatant.getTalentRank(TALENTS_MONK.SAVE_THEM_ALL_TALENT) * BUFF_PER_POINT;
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SAVE_THEM_ALL_BUFF.id)) {
      return;
    }
    this.totalHealed += calculateEffectiveHealing(event, this.healingBuff);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.SAVE_THEM_ALL_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealed),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Total Healed: {formatNumber(this.totalHealed)} <br />
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
