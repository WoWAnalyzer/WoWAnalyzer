import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import Statistic from 'parser/ui/Statistic';
import { SpellIcon } from 'interface';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { formatNumber } from 'common/format';

class ColdFront extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  bonusFrozenOrbs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.COLD_FRONT.bonusID);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.COLD_FRONT_BUFF), this.onBuffApplied);
  }

  onBuffApplied() {
    const buffRemovedEvent = this.eventHistory.last(1,500,Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.COLD_FRONT_BUFF));
    if (buffRemovedEvent) {
      this.bonusFrozenOrbs += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip="This shows the number of extra Frozen Orb casts that were gained by using the Cold Front legendary effect."
      >
        <BoringSpellValueText spell={SPELLS.COLD_FRONT}>
          <SpellIcon id={SPELLS.FROZEN_ORB.id} /> {`${formatNumber(this.bonusFrozenOrbs)}`} <small>Extra Frozen Orbs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ColdFront;
