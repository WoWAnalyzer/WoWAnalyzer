import { formatPercentage } from 'common/format';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SheilunsGift from './SheilunsGift';

class VeilOfPride extends Analyzer {
  static dependencies = {
    sheilunsGift: SheilunsGift,
  };
  protected sheilunsGift!: SheilunsGift;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.VEIL_OF_PRIDE_TALENT);
  }

  get totalHealing() {
    return this.sheilunsGift.totalHealing / 2;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.VEIL_OF_PRIDE_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.VEIL_OF_PRIDE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} /> <br />
          {(this.sheilunsGift.averageClouds / 2).toFixed(1)} <small>extra clouds</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default VeilOfPride;
