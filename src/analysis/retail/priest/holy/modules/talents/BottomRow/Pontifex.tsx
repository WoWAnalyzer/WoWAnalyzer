import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';

const PONTIFEX_HEALING_INCREASE = 0.06;
//const PONTIFEX_MAX_STACKS = 5;

const HOLY_WORD_LIST = [
  TALENTS.HOLY_WORD_SALVATION_TALENT,
  TALENTS.HOLY_WORD_SANCTIFY_TALENT,
  TALENTS.HOLY_WORD_SERENITY_TALENT,
];

const PONTIFEX_TRIGGER_LIST = [
  SPELLS.FLASH_HEAL,
  SPELLS.GREATER_HEAL,
  TALENTS.PRAYER_OF_HEALING_TALENT,
  TALENTS.CIRCLE_OF_HEALING_TALENT,
];

/**
 * Critical heals from Flash Heal and Heal increase your healing done by
 * your next Holy Word spell by 20%, stacking up to 2 times.
 */

class Pontifex extends Analyzer {
  totalPontifexStacks = 0;
  usedPontifexStacks = 0;
  effectiveAdditionalHealing: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PONTIFEX_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(PONTIFEX_TRIGGER_LIST),
      this.onPontifexHealCast,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(HOLY_WORD_LIST), this.onBuffedCast);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(HOLY_WORD_LIST), this.onBuffedHeal);
  }

  get wastedPontifexStacks() {
    return this.totalPontifexStacks - this.usedPontifexStacks;
  }

  get percentOverhealing() {
    const rawHealing = this.effectiveAdditionalHealing + this.overhealing;
    if (rawHealing === 0) {
      return 0;
    }
    return this.overhealing / rawHealing;
  }

  onPontifexHealCast() {
    this.totalPontifexStacks += 1;
  }

  onBuffedCast() {
    const pontifexBuffStacks = this.selectedCombatant.getBuffStacks(SPELLS.PONTIFEX_TALENT_BUFF.id);
    if (pontifexBuffStacks > 0) {
      this.usedPontifexStacks += pontifexBuffStacks;
    }
  }

  onBuffedHeal(event: HealEvent) {
    const pontifexBuffStacks = this.selectedCombatant.getBuffStacks(SPELLS.PONTIFEX_TALENT_BUFF.id);
    // Casted a Holy word with at least one stack of Pontifex
    if (pontifexBuffStacks > 0) {
      const healingIncrease = PONTIFEX_HEALING_INCREASE * pontifexBuffStacks;
      const effectiveHealAmount = calculateEffectiveHealing(event, healingIncrease);
      const overHealAmount = calculateOverhealing(event, healingIncrease);

      this.effectiveAdditionalHealing += effectiveHealAmount;
      this.overhealing += overHealAmount;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.wastedPontifexStacks} stacks of Pontifex wasted.
            <br />
            Total Healing: {formatNumber(this.effectiveAdditionalHealing + this.overhealing)} (
            {formatPercentage(this.percentOverhealing)}% OH)
          </>
        }
      >
        <TalentSpellText talent={TALENTS.PONTIFEX_TALENT}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Pontifex;
