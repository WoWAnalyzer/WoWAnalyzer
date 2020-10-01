import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatPercentage, formatThousands } from 'common/format';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

class PrayerCircle extends Analyzer {
  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PRAYER_CIRCLE_TALENT.id);

    if (this.active) {
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CIRCLE_OF_HEALING_TALENT), this.cohCast);
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PRAYER_OF_HEALING), this.pohCast);
    }
  }

  cohCast(event: CastEvent) {

  }

  pohCast(event: CastEvent) {

  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>

          </>
        )}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <BoringSpellValueText spell={SPELLS.CIRCLE_OF_HEALING_TALENT}>
          <></>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrayerCircle;
