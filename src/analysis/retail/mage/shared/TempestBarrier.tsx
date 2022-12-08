import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { AbsorbedEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

class TempestBarrier extends Analyzer {
  conduitRank = 0;
  damageAbsorbed = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.conduitRank = 0;
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_BARRIER_ABSORB),
      this.onAbsorb,
    );
  }

  onAbsorb(event: AbsorbedEvent) {
    this.damageAbsorbed += event.amount;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.TEMPEST_BARRIER.id}>
          {formatNumber(this.damageAbsorbed)} <small>Damage absorbed</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TempestBarrier;
