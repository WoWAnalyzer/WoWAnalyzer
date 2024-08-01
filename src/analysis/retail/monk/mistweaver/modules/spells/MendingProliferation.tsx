import { TALENTS_MONK } from 'common/TALENTS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ENVELOPING_MIST_INCREASE, MISTWRAP_INCREASE } from '../../constants';
import SPELLS from 'common/SPELLS';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { formatPercentage } from 'common/format';

class MendingProliferation extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  mendingProlifHealingIncrease: number = 0;
  bonusHealingFromMendingProlif: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MENDING_PROLIFERATION_TALENT);
    if (!this.active) {
      return;
    }
    this.mendingProlifHealingIncrease =
      ENVELOPING_MIST_INCREASE +
      MISTWRAP_INCREASE * this.selectedCombatant.getTalentRank(TALENTS_MONK.MIST_WRAP_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleHeal);
  }

  handleHeal(event: HealEvent) {
    const targetID = event.targetID;
    if (
      !this.combatants.players[targetID] ||
      event.ability.guid === TALENTS_MONK.ENVELOPING_MIST_TALENT.id
    ) {
      return;
    }
    if (
      this.combatants.players[targetID].hasBuff(
        SPELLS.MENDING_PROLIFERATION_BUFF.id,
        event.timestamp,
        0,
        0,
      )
    ) {
      this.bonusHealingFromMendingProlif += calculateEffectiveHealing(
        event,
        this.mendingProlifHealingIncrease,
      );
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.MENDING_PROLIFERATION_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.bonusHealingFromMendingProlif),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(500)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS_MONK.MENDING_PROLIFERATION_TALENT} /> Mending Proliferation
            </>
          }
        >
          <ItemHealingDone amount={this.bonusHealingFromMendingProlif}></ItemHealingDone>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default MendingProliferation;
