import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';

const HEALING_BONUS_PER_STACK = 0.01;
const MAX_STACKS = 50;

//Example log: /reports/w9BXrzFApPbj6LnG#fight=14&type=healing&source=19
class HealingChorus extends Analyzer {
  totalStacks = 0;
  usedStacks = 0;
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  currentStacks = 0;
  totalCOHHealing = 0;

  lastHealedTimestamp = 0;
  lastHealedMultiplier = 0;
  //Circle of healing triggers multiple events but we remove the stacks at the first event
  //To apply the healing increase to all hits we save the timestamp and multiplier
  //If errors occur the timestamp check might need to include an epsilon check but does not seem neccesary

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HEALING_CHORUS_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.CIRCLE_OF_HEALING_TALENT),
      this.onHeal,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.HEALING_CHORUS_TALENT_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HEALING_CHORUS_TALENT_BUFF),
      this.onBuff,
    );
  }
  onHeal(Event: HealEvent) {
    if (Event.timestamp === this.lastHealedTimestamp) {
      this.healingDoneFromTalent += calculateEffectiveHealing(Event, this.lastHealedMultiplier);
      this.overhealingDoneFromTalent += calculateOverhealing(Event, this.lastHealedMultiplier);
    }
    if (this.currentStacks > 0) {
      const multiplier = this.currentStacks * HEALING_BONUS_PER_STACK;

      this.healingDoneFromTalent += calculateEffectiveHealing(Event, multiplier);
      this.overhealingDoneFromTalent += calculateOverhealing(Event, multiplier);

      this.currentStacks = 0;
      this.lastHealedTimestamp = Event.timestamp;
      this.lastHealedMultiplier = multiplier;
      this.usedStacks += 1;
    }

    this.totalCOHHealing += Event.amount;
  }

  onBuff() {
    this.totalStacks += 1;
    if (this.currentStacks < MAX_STACKS) {
      this.currentStacks += 1;
    }
  }

  statistic() {
    const overhealingTooltipString = formatPercentage(
      this.overhealingDoneFromTalent /
        (this.healingDoneFromTalent + this.overhealingDoneFromTalent),
    );
    const circleOfHealingPercentage = formatPercentage(
      this.healingDoneFromTalent / this.totalCOHHealing,
    );
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`You gained ${this.totalStacks} stacks in total. ${overhealingTooltipString}% overhealing`}
      >
        <BoringSpellValueText spell={TALENTS.HEALING_CHORUS_TALENT}>
          <ItemHealingDone amount={this.healingDoneFromTalent} />
          <br />
          {circleOfHealingPercentage}% of your total{' '}
          <SpellLink spell={TALENTS.CIRCLE_OF_HEALING_TALENT} /> healing
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default HealingChorus;
