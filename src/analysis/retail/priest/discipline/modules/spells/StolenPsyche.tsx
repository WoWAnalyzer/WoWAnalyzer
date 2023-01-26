import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const STOLEN_PSYCHE_RANK_INCREASE = 0.2;

class StolenPsyche extends Analyzer {
  healing = 0;
  talentRank = 0;
  stolenPsycheIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
    this.talentRank = 0;
    this.stolenPsycheIncrease = this.talentRank * STOLEN_PSYCHE_RANK_INCREASE;
  }

  onAtonement(event: AtonementAnalyzerEvent) {
    const { healEvent, damageEvent } = event;

    if (damageEvent?.ability.guid !== SPELLS.MIND_BLAST.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(healEvent, this.stolenPsycheIncrease);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(15)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_PRIEST.ABYSSAL_REVERIE_TALENT.id}>
          <>
            <ItemHealingDone amount={this.healing} /> <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StolenPsyche;
