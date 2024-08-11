import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

class TempestBarrier extends Analyzer {
  damageAbsorbed = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TEMPEST_BARRIER_TALENT);
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
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.TEMPEST_BARRIER_TALENT}>
          {formatNumber(this.damageAbsorbed)} <small>Damage absorbed</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TempestBarrier;
