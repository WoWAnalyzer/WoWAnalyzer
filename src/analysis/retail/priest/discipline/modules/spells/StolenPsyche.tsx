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

const STOLEN_PSYCHE_RANK_INCREASE = 0.2;

class StolenPsyche extends Analyzer {
  healing = 0;
  talentRank = 0;
  stolenPsycheIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.STOLEN_PSYCHE_TALENT.id);
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
    this.talentRank = this.selectedCombatant.getTalentRank(TALENTS_PRIEST.STOLEN_PSYCHE_TALENT.id);
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
      <Statistic size="flexible" category={STATISTIC_CATEGORY.COVENANTS}>
        <BoringSpellValueText spellId={TALENTS_PRIEST.STOLEN_PSYCHE_TALENT.id}>
          <>
            <ItemHealingDone amount={this.healing} /> <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StolenPsyche;
