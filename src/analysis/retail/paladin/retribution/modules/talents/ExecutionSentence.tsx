import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class ExecutionSentence extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT);

    // event listeners
  }

  get totalDamage() {
    return this.abilityTracker.getAbility(SPELLS.EXECUTION_SENTENCE_TALENT.id).damageEffective;
  }

  get totalDps() {
    return (this.totalDamage / this.owner.fightDuration) * 1000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        tooltip={
          <>
            Total damage contributed: {formatNumber(this.totalDamage)} <br />
            DPS from Execution Sentence: {formatNumber(this.totalDps)} <br />
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.EXECUTION_SENTENCE_TALENT.id}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ExecutionSentence;
