import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HasHitpoints, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_MONK } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { SAVE_THEM_ALL_MAX_INCREASE, ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';

class SaveThemAll extends Analyzer {
  totalHealed = 0;
  excludedHealing = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SAVE_THEM_ALL_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }

    const healAmount = event.amount || 0;

    if (!HasHitpoints(event)) {
      this.excludedHealing += healAmount;
      return;
    }

    const hpBeforeHeal = event.hitPoints - healAmount;
    const healingIncrease = (1 - hpBeforeHeal / event.maxHitPoints) * SAVE_THEM_ALL_MAX_INCREASE;

    this.totalHealed += calculateEffectiveHealing(event, healingIncrease);
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
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>Total Healed: {formatNumber(this.totalHealed)}</div>
            {this.excludedHealing > 0 && (
              <div>
                Excluded healing with incomplete data:{' '}
                {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.excludedHealing))}
                % of total
              </div>
            )}
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
