import { formatNumber, formatPercentage } from 'common/format';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  ENVELOPING_MIST_INCREASE,
  MISTWRAP_INCREASE,
} from '../../constants';
import HotTrackerMW from '../core/HotTrackerMW';

const ENVELOPING_BASE_DURATION = 6000;
//TODO include boosts from env specific buffs like peaceful mending or Lifecocoon
class MistWrap extends Analyzer {
  effectiveHealing = 0;
  overHealing = 0;
  envMistHealingBoost = 0;

  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };
  protected hotTracker!: HotTrackerMW;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.hotHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.genericHeal);
  }

  hotHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }

    const hot = this.hotTracker.hots[targetId][spellId];
    if (hot) {
      if (hot.start + ENVELOPING_BASE_DURATION < event.timestamp && hot.extensions?.length === 0) {
        this.effectiveHealing += event.amount + (event.absorbed || 0);
        this.overHealing += event.overheal || 0;
      } else {
        const totalExtension = hot.extensions.reduce((sum, cur) => sum + cur.amount, 0);
        if (hot.start + ENVELOPING_BASE_DURATION + totalExtension < event.timestamp) {
          this.effectiveHealing += event.amount + (event.absorbed || 0);
          this.overHealing += event.overheal || 0;
        }
      }
    }
  }

  genericHeal(event: HealEvent) {
    const spellId = event.ability.guid;

    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }

    this.calculateEnvelopingMist(event);
  }

  private calculateEnvelopingMist(event: HealEvent) {
    const envMistHot = this.hotTracker.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
    if (envMistHot) {
      //check for extensions
      if (envMistHot.extensions?.length === 0) {
        //bonus healing is full value from additional time or 10% from additional healing based on timestamp
        this.envMistHealingBoost +=
          envMistHot.start + ENVELOPING_BASE_DURATION < event.timestamp
            ? calculateEffectiveHealing(event, ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE)
            : calculateEffectiveHealing(event, MISTWRAP_INCREASE);
      } else {
        //get total extensions and apply bonus healing
        //This whole block is a necessary bandaid because misty peaks procs silently extend the duration
        //and reset the extension cap on existing enveloping mist without a refresh event
        const totalExtension = envMistHot.extensions.reduce((sum, cur) => sum + cur.amount, 0);
        const totalDuration = event.timestamp - envMistHot.start;

        if (totalDuration > Number(envMistHot.maxDuration)) {
          this.envMistHealingBoost += calculateEffectiveHealing(event, MISTWRAP_INCREASE);
        } else {
          this.envMistHealingBoost +=
            envMistHot.start + ENVELOPING_BASE_DURATION + totalExtension < event.timestamp
              ? calculateEffectiveHealing(event, ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE)
              : calculateEffectiveHealing(event, MISTWRAP_INCREASE);
        }
      }
    }
  }

  get totalHealing() {
    return this.envMistHealingBoost + this.effectiveHealing;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.MIST_WRAP_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Effective HoT Healing: {formatNumber(this.effectiveHealing)}
            <br />
            HoT Overhealing: {formatNumber(this.overHealing)}
            <br />
            <br />
            Bonus Healing from extra <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />{' '}
            duration: {formatNumber(this.envMistHealingBoost)}
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MIST_WRAP_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MistWrap;
