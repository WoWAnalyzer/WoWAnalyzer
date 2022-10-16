import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/';
import TALENTS from 'common/TALENTS/priest';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatPercentage } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellLink } from 'interface';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';

const HEALING_BONUS_PER_STACK = 0.15;
const MAX_STACKS = 2;

//Example log: /report/kVQd4LrBb9RW2h6K/9-Heroic+The+Primal+Council+-+Wipe+5+(5:04)/Delipriest/standard/statistics
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
      this.onBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LIGHTWEAVER_TALENT_BUFF),
      this.onBuff,
    );
  }

  onHeal(Event: HealEvent) {
    if (this.currentStacks > 0) {
      this.healingDoneFromTalent += calculateEffectiveHealing(
        Event,
        HEALING_BONUS_PER_STACK * this.currentStacks,
      );
      this.overhealingDoneFromTalent += calculateOverhealing(
        Event,
        HEALING_BONUS_PER_STACK * this.currentStacks,
      );

      this.currentStacks = 0;
      this.timesUsedBuffed += 1;
    } else {
      this.timesUsedUnbuffed += 1;
    }
  }

  onBuff() {
    this.totalStacks += 1;
    if (this.currentStacks < MAX_STACKS) {
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
