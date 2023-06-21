import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const JUDGEMENT_HEALS = 5;

class JudgmentOfLight extends Analyzer {
  counter = JUDGEMENT_HEALS;
  wasted = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.JUDGMENT_OF_LIGHT_TALENT);
    if (!this.active) {
      return;
    }
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
    this.wasted += JUDGEMENT_HEALS - this.counter;
    this.casts += 1;
    this.counter = 0;
  }

  handleHeals(event: HealEvent) {
    if (this.counter < JUDGEMENT_HEALS) {
      this.counter += 1;
    }
  }

  statistic() {
    this.wasted += JUDGEMENT_HEALS - this.counter;
    return (
      <Statistic position={STATISTIC_ORDER.CORE(10)} category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spell={TALENTS.JUDGMENT_OF_LIGHT_TALENT}>
          {formatNumber(this.wasted)} Wasted Stacks
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default JudgmentOfLight;
