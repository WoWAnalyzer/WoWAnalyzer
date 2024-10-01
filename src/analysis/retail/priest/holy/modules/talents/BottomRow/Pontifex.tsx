import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { PONTIFEX_HEALING_INCREASE } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import SpellLink from 'interface/SpellLink';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

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
 * Flash Heal, Heal, Prayer of Healing, and Circle of Healing
 * increase the healing done by your next Holy Word spell by 6%,
 * stacking up to 5 times. (30 sec)
 */

class Pontifex extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  eolContrib = 0;

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
      this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(event, healingIncrease);
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
            <br />
            <div>Breakdown:</div>
            <div>
              <SpellLink spell={TALENTS_PRIEST.PONTIFEX_TALENT} />:{' '}
              <ItemPercentHealingDone
                amount={this.effectiveAdditionalHealing}
              ></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.PONTIFEX_TALENT}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing + this.eolContrib} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Pontifex;
