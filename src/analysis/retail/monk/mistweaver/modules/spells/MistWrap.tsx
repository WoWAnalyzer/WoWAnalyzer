import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
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
import { ENVELOPING_MIST_INCREASE, MISTWRAP_INCREASE } from '../../constants';
import HotTrackerMW from '../core/HotTrackerMW';

const ENVELOPING_BASE_DURATION = 6000;

class MistWrap extends Analyzer {
  hotInfo: Map<string, HotInfo> = new Map<string, HotInfo>();

  effectiveHealing: number = 0;
  overHealing: number = 0;
  envMistHealingBoost: number = 0;
  envBreathHealingBoost: number = 0;

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
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ENVELOPING_BREATH_HEAL, TALENTS_MONK.ENVELOPING_MIST_TALENT]),
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
        let totalExtension = 0;
        Object.keys(hot.extensions).forEach((idx, index) => {
          totalExtension += hot.extensions[index].amount;
        });
        if (hot.start + ENVELOPING_BASE_DURATION + totalExtension < event.timestamp) {
          this.effectiveHealing += event.amount + (event.absorbed || 0);
          this.overHealing += event.overheal || 0;
        }
      }
    }
  }

  genericHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.ENVELOPING_BREATH_HEAL.id] ||
      !this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
    ) {
      return;
    }

    const envMistHot = this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
    const envBreathHot = this.hotTracker.hots[targetId][SPELLS.ENVELOPING_BREATH_HEAL.id];
    //handle envelop mist bonus healing
    if (envMistHot && spellId !== TALENTS_MONK.ENVELOPING_MIST_TALENT.id) {
      //check for extensions
      if (envMistHot.extensions?.length === 0) {
        //bonus healing is 40% from additional time or 10% from additional healing based on timestamp
        this.envMistHealingBoost +=
          envMistHot.start + ENVELOPING_BASE_DURATION < event.timestamp
            ? calculateEffectiveHealing(event, ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE)
            : calculateEffectiveHealing(event, MISTWRAP_INCREASE);
      } else {
        //get total extensions and apply bonus healing
        let totalExtension = 0;
        Object.keys(envMistHot.extensions).forEach((idx, index) => {
          totalExtension += envMistHot.extensions[index].amount;
        });
        //bonus healing is 40% from additional time or 10% from additional healing based on timestamp
        this.envMistHealingBoost +=
          envMistHot.start + ENVELOPING_BASE_DURATION + totalExtension < event.timestamp
            ? calculateEffectiveHealing(event, ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE)
            : calculateEffectiveHealing(event, MISTWRAP_INCREASE);
      }
    }
    //handle envelop breath bonus healing
    if (
      envBreathHot &&
      envBreathHot.start + ENVELOPING_BASE_DURATION < event.timestamp &&
      spellId !== SPELLS.ENVELOPING_BREATH_HEAL.id
    ) {
      this.envBreathHealingBoost += calculateEffectiveHealing(event, MISTWRAP_INCREASE);
    }
  }

  get totalHealing() {
    return this.envBreathHealingBoost + this.envMistHealingBoost + this.effectiveHealing;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.MIST_WRAP_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Effective Healing: {formatNumber(this.effectiveHealing)}
            <br />
            Overhealing: {formatNumber(this.overHealing)}
            <br />
            Bonus Healing from extra <SpellLink
              id={SPELLS.ENVELOPING_BREATH_HEAL.id}
            /> duration: {formatNumber(this.envBreathHealingBoost)}
            <br />
            Bonus Healing from extra <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} />{' '}
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

type HotInfo = {
  applyTimeStamp: number;
  playerAppliedTo: string;
  spellId: number;
};
