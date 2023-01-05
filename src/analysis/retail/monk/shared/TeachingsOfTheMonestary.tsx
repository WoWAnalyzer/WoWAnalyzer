import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_MONK } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';

class TeachingsOfTheMonestary extends Analyzer {
  stackList: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK), this.onCast);
  }

  onCast(event: CastEvent) {
    const numStacks = this.selectedCombatant.getBuffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY.id);
    console.log(this.owner.formatTimestamp(event.timestamp), numStacks);
    this.stackList.push(numStacks);
  }

  get averageStacks() {
    return this.stackList.reduce((prev, cur) => prev + cur, 0) / this.stackList.length;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT}>
          {this.averageStacks.toFixed(2)} <small> average stacks</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TeachingsOfTheMonestary;
