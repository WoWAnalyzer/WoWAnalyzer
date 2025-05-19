import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { JUDGMENT_OF_LIGHT_HEALS } from '../../constants';

class JudgmentOfLight extends Analyzer {
  counter = JUDGMENT_OF_LIGHT_HEALS;
  wasted = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.JUDGMENT_OF_LIGHT_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST_HOLY),
      this.resetCounter,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_OF_LIGHT_HEAL),
      this.handleHeals,
    );
  }

  resetCounter(event: CastEvent) {
    this.wasted += JUDGMENT_OF_LIGHT_HEALS - this.counter;
    this.casts += 1;
    this.counter = 0;
  }

  handleHeals(event: HealEvent) {
    if (this.counter < JUDGMENT_OF_LIGHT_HEALS) {
      this.counter += 1;
    }
  }

  statistic() {
    this.wasted += JUDGMENT_OF_LIGHT_HEALS - this.counter;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS.JUDGMENT_OF_LIGHT_TALENT}>
          {this.wasted} <small>wasted stacks</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default JudgmentOfLight;
