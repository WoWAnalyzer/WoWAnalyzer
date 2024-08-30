import SPELLS from 'common/SPELLS';
import { TALENTS_PALADIN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import { ReactNode } from 'react';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatNumber } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class OverflowingLight extends Analyzer {
  totalDamageAbsorbed = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.OVERFLOWING_LIGHT_TALENT);

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.OVERFLOWING_LIGHT_BUFF),
      this._onOLAbsorb,
    );
  }

  _onOLAbsorb(event: AbsorbedEvent) {
    this.totalDamageAbsorbed += event.amount;
  }

  statistic(): ReactNode {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS_PALADIN.OVERFLOWING_LIGHT_TALENT}>
          <div>
            {formatNumber(this.totalDamageAbsorbed)} <small>damage absorbed</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default OverflowingLight;
