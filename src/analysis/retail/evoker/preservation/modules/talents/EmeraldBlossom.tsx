import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

const BOUNTIFUL_ADDITIONAL_TARGETS = 2;

class EmeraldBlossom extends Analyzer {
  bountifulBloomHealing: number = 0;
  bountifulBloomOverhealing: number = 0;
  totalHealing: number = 0;
  totalOverhealing: number = 0;
  totalHits: number = 0;
  numCasts: number = 0;
  lastHit: number = 0;

  hasBountiful: boolean = false;

  constructor(options: Options) {
    super(options);
    this.hasBountiful = this.selectedCombatant.hasTalent(TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.EMERALD_BLOSSOM_CAST]),
      this.onCast,
    );
  }

  get averageNumTargets() {
    return this.totalHits / this.numCasts;
  }

  onCast(event: CastEvent) {
    console.log('ye');
  }

  get suggestionThresholds() {
    return {
      actual: this.averageNumTargets,
      isLessThan: {
        minor: 3 + Number(this.hasBountiful) * BOUNTIFUL_ADDITIONAL_TARGETS,
        average: 2.5 + Number(this.hasBountiful) * BOUNTIFUL_ADDITIONAL_TARGETS,
        major: 2 + Number(this.hasBountiful) * BOUNTIFUL_ADDITIONAL_TARGETS,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    console.log('ye');
  }

  statistic() {
    return this.hasBountiful ? (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT}>
          <ItemHealingDone amount={this.bountifulBloomHealing} />
        </TalentSpellText>
      </Statistic>
    ) : null;
  }
}

export default EmeraldBlossom;
