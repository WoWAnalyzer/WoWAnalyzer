import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatThousands } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';

const PONTIFEX_HEALING_INCREASE = 0.1;

/**
 * Critical heals from Flash Heal and Heal increase your healing done by
 * your next Holy Word spell by 10%, stacking up to 2 times.
 */

class Pontifex extends Analyzer {
  effectiveHealing = 0;
  overhealing = 0;
  wastedStacks = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PONTIFEX_TALENT.id);

    // Healing spells that give stacks of Pontifex buff
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.FLASH_HEAL, SPELLS.GREATER_HEAL]),
      this.onPontifexHealCast,
    );

    // Healing spells buffed by Pontifex
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS.HOLY_WORD_SERENITY_TALENT,
          TALENTS.HOLY_WORD_SANCTIFY_TALENT,
          TALENTS.HOLY_WORD_SALVATION_TALENT,
        ]),
      this.onBuffedCast,
    );
  }

  onPontifexHealCast(event: HealEvent) {
    const pontifexBuffStacks = this.selectedCombatant.getBuffStacks(SPELLS.PONTIFEX_TALENT_BUFF.id);

    // Casted a FH or Heal with 2 stacks of Pontifex, and that cast crit.
    if (event.hitType === HIT_TYPES.CRIT && pontifexBuffStacks === 2) {
      this.wastedStacks += 1;
    }
  }

  onBuffedCast(event: HealEvent) {
    const pontifexBuffStacks = this.selectedCombatant.getBuffStacks(SPELLS.PONTIFEX_TALENT_BUFF.id);

    // Casted a Holy word with at least one stack of Pontifex
    if (pontifexBuffStacks > 0) {
      this.effectiveHealing += calculateEffectiveHealing(event, PONTIFEX_HEALING_INCREASE);
      this.overhealing += calculateOverhealing(event, PONTIFEX_HEALING_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.wastedStacks} stacks of Pontifex wasted.
            <br />
            Healing: {formatThousands(this.effectiveHealing)}
            <br />
            Overhealing: {formatThousands(this.overhealing)}
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.PONTIFEX_TALENT.id}>
          <ItemHealingDone amount={this.effectiveHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Pontifex;
