import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
// import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
// import Events, { HealEvent, } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';
import { RABID_SHADOWS_INCREASE } from '@wowanalyzer/priest-discipline/src/constants';
class RabidShadows extends Analyzer {
  conduitRank: number = 0;
  conduitIncrease: number = 0;
  bonusAtonementHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.RABID_SHADOWS.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.conduitIncrease = RABID_SHADOWS_INCREASE[this.conduitRank];

    // this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtone);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.SHINING_RADIANCE.id} rank={this.conduitRank}>
          <>
            <ItemHealingDone amount={this.bonusAtonementHealing} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default RabidShadows;
