import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import HotTrackerMW from '../core/HotTrackerMW';
import Combatants from 'parser/shared/modules/Combatants';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  LOTUS_INFUSION_BOOST,
  REM_BASE_DURATION,
  RISING_MIST,
  TFT_REM_EXTRA_DURATION,
} from '../../constants';
import { ReactNode } from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import SpellLink from 'interface/SpellLink';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

class LotusInfusion extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };

  protected hotTracker!: HotTrackerMW;
  protected combatants!: Combatants;

  renewingMistHealingBoost: number = 0;
  renewingMistOverhealingBoost: number = 0;
  effectiveHealing: number = 0;
  overhealing: number = 0;
  risingMistActive: boolean;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.LOTUS_INFUSION_TALENT);
    this.risingMistActive = this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onHotHeal,
    );
  }

  get totalHealing() {
    return this.effectiveHealing + this.renewingMistHealingBoost;
  }

  private onHotHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }

    const hot = this.hotTracker.hots[targetId][spellId];
    if (hot) {
      //filter source rems that don't get the additional duration
      if (this.hotTracker.fromRapidDiffusion(hot) || this.hotTracker.fromMistsOfLife(hot)) {
        return;
      }

      //determine base and max duration
      let baseDuartion;
      const tftDuration =
        (REM_BASE_DURATION + TFT_REM_EXTRA_DURATION + LOTUS_INFUSION_BOOST) *
        (this.risingMistActive ? RISING_MIST : 0);

      if ((hot.maxDuration || 0) >= tftDuration) {
        baseDuartion = REM_BASE_DURATION + TFT_REM_EXTRA_DURATION;
      } else {
        baseDuartion = REM_BASE_DURATION;
      }

      //attribute healing from additional base and, if rising mist is active, the additional extended 2s if applicable
      if (hot.start + baseDuartion < event.timestamp && hot.extensions?.length === 0) {
        this.effectiveHealing += event.amount + (event.absorbed || 0);
        this.overhealing += event.overheal || 0;
      } else {
        if (!this.risingMistActive) {
          return;
        }
        let totalExtension = 0;
        Object.keys(hot.extensions).forEach((idx, index) => {
          totalExtension += hot.extensions[index].amount;
        });

        if (hot.start + baseDuartion + totalExtension < event.timestamp) {
          this.effectiveHealing += event.amount + (event.absorbed || 0);
          this.overhealing += event.overheal || 0;
        }
      }
    }
  }

  private onHeal(event: HealEvent) {
    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }
    const targetId = event.targetID;

    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }

    this.renewingMistHealingBoost += calculateEffectiveHealing(event, LOTUS_INFUSION_BOOST);
    this.renewingMistOverhealingBoost += calculateOverhealing(event, LOTUS_INFUSION_BOOST);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.LOTUS_INFUSION_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic(): ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              Effective healing from the {formatPercentage(LOTUS_INFUSION_BOOST)}% increase:{' '}
              {formatNumber(this.renewingMistHealingBoost)}
            </li>
            <li>Overhealing: {formatNumber(this.renewingMistOverhealingBoost)}</li>
            <li>
              Additional <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> healing:{' '}
              {formatNumber(this.effectiveHealing)}
            </li>
            <li>Hot Overhealing: {formatNumber(this.overhealing)}</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.LOTUS_INFUSION_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LotusInfusion;
