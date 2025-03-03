import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_MONK } from 'common/TALENTS';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import { RESPLENDENT_MISTS_INC } from '../../constants';
import HotTrackerMW from '../core/HotTrackerMW';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import SpellLink from 'interface/SpellLink';

class ResplendentMists extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
    hotTracker: HotTrackerMW,
  };
  protected healingDone!: HealingDone;
  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerMW;

  healing: number = 0;
  overheal: number = 0;
  increase: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RESPLENDENT_MIST_TALENT);

    if (!this.active) {
      return;
    }

    this.increase =
      RESPLENDENT_MISTS_INC *
      this.selectedCombatant.getTalentRank(TALENTS_MONK.RESPLENDENT_MIST_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.GUSTS_OF_MISTS, SPELLS.GUST_OF_MISTS_CHIJI]),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.healing += calculateEffectiveHealing(event, this.increase);
    this.overheal += calculateOverhealing(event, this.increase);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.RESPLENDENT_MIST_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>
              Total healing: {formatNumber(this.healing)} (
              {formatPercentage(this.overheal / (this.healing + this.overheal))}% overheal)
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.RESPLENDENT_MIST_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ResplendentMists;
