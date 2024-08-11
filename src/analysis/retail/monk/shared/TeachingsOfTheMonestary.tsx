import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_MONK } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPECS from 'game/SPECS';

class TeachingsOfTheMonestary extends Analyzer {
  numCasts: number = 0;
  totalStacks: number = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT) ||
      this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK), this.onCast);
  }

  onCast(event: CastEvent) {
    this.numCasts += 1;
    this.totalStacks += this.selectedCombatant.getBuffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY.id);
  }

  get averageStacks() {
    return this.totalStacks / this.numCasts;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
      >
        <TalentSpellText talent={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT}>
          {this.averageStacks.toFixed(2)} <small> average stacks</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TeachingsOfTheMonestary;
