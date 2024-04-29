import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ApplyBuffStackEvent, DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamageFromCritIncrease } from 'parser/core/EventCalculateLib';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class MindMelt extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  damage = 0;
  buffStacks = 0;
  multiplierCritMindMelt = 0.2; //20% per stack

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MIND_MELT_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_MELT_TALENT_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MIND_MELT_TALENT_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_MELT_TALENT_BUFF),
      this.onBuffRemoved,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST),
      this.onMindBlast,
    );
  }

  onBuffApplied() {
    this.buffStacks = 1;
  }
  onBuffStack(event: ApplyBuffStackEvent) {
    this.buffStacks = event.stack;
  }
  onBuffRemoved() {
    this.buffStacks = 0;
  }

  onMindBlast(event: DamageEvent) {
    this.damage += calculateEffectiveDamageFromCritIncrease(
      event,
      this.statTracker.currentCritPercentage,
      this.buffStacks * this.multiplierCritMindMelt,
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="This is the damage gained from the critical increase"
      >
        <BoringSpellValueText spell={TALENTS.MIND_MELT_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MindMelt;
