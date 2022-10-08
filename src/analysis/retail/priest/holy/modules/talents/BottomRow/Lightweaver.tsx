import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffStackEvent, ApplyBuffEvent, HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/';
import TALENTS from 'common/TALENTS/priest';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatPercentage } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellLink } from 'interface';

const HEALINGBONUSPERSTACK = 0.15;
const MAXSTACKS = 2;

class Lightweaver extends Analyzer {
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  timesUsedBuffed = 0;
  timesUsedUnbuffed = 0;
  overcappedStacks = 0;
  totalStacks = 0;
  currentStacks = 0;

  constructor(options: Options) {
    super(options);

    if (!this.selectedCombatant.hasTalent(TALENTS.LIGHTWEAVER_TALENT)) {
      this.active = false;
      return;
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL), this.onHeal);
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LIGHTWEAVER_TALENT_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LIGHTWEAVER_TALENT_BUFF),
      this.onBuffed,
    );
  }

  onHeal(Event: HealEvent) {
    if (this.currentStacks > 0) {
      const overhealing = Event.overheal != null ? Event.overheal : 0;
      const absorbed = Event.absorbed != null ? Event.absorbed : 0;
      const totalHealing = Event.amount + overhealing + absorbed;

      const totalHealingFromTalent =
        totalHealing - totalHealing / (1 + HEALINGBONUSPERSTACK * this.currentStacks);
      this.overhealingDoneFromTalent +=
        overhealing <= totalHealingFromTalent ? overhealing : totalHealingFromTalent;
      this.healingDoneFromTalent += Math.max(totalHealingFromTalent - overhealing, 0);

      this.currentStacks = 0;
      this.timesUsedBuffed += 1;
    } else {
      this.timesUsedUnbuffed += 1;
    }
  }

  onBuffed(Event: ApplyBuffEvent) {
    this.totalStacks += 1;
    if (this.currentStacks < MAXSTACKS) {
      this.currentStacks += 1;
    } else {
      this.overcappedStacks += 1;
    }
  }
  onBuffStack(Event: ApplyBuffStackEvent) {
    this.totalStacks += 1;
    if (this.currentStacks < MAXSTACKS) {
      this.currentStacks += 1;
    } else {
      this.overcappedStacks += 1;
    }
  }

  statistic() {
    const overhealingTooltipString = formatPercentage(
      this.overhealingDoneFromTalent /
        (this.healingDoneFromTalent + this.overhealingDoneFromTalent),
    );

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${this.overcappedStacks}/${this.totalStacks} wasted stacks. ${overhealingTooltipString}% overhealing`}
      >
        <BoringSpellValueText spellId={TALENTS.LIGHTWEAVER_TALENT.id}>
          <ItemHealingDone amount={this.healingDoneFromTalent} />
          <br />
          {this.timesUsedBuffed} buffed <SpellLink id={SPELLS.GREATER_HEAL.id} /> casts
          <br />
          {this.timesUsedUnbuffed} unbuffed <SpellLink id={SPELLS.GREATER_HEAL.id} /> casts
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default Lightweaver;
