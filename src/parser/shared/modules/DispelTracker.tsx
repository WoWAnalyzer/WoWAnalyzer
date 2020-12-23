import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Events, { DispelEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';

class DispelTracker extends Analyzer {
  dispelEvents = new Map<number, number>();
  dispelCount = 0;

  blackList = [SPELLS.WINDWALKING.id];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.dispel.by(SELECTED_PLAYER), this.onDispel);
  }

  onDispel(event: DispelEvent) {
    const abilityDispelled = event.extraAbility;
    const dispelledId = abilityDispelled.guid;
    if (this.blackList.includes(dispelledId)) {
      return;
    }
    const currentCount = this.dispelEvents.get(dispelledId) || 0;
    this.dispelEvents.set(dispelledId, currentCount + 1);

    if (!SPELLS[dispelledId]) {
      // The spells need to be defined so the view doesn't crash
      SPELLS[dispelledId] = {
        id: dispelledId,
        name: abilityDispelled.name,
        icon: abilityDispelled.abilityIcon.replace('.jpg', ''),
      };
    }
    this.dispelCount += 1;
  }

  statistic() {
    if (this.dispelCount < 1) {
      return null;
    }

    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(1)} size="flexible">
        <div className="pad">
          <label>
            <Trans id="shared.dispelTracker.label">Dispels</Trans>
          </label>
          {Array.from(this.dispelEvents).map(([dispelledId, count]) => (
            <div className="flex" key={dispelledId}>
              <div className="flex-sub" style={{ flex: 3 }}>
                <SpellLink id={Number(dispelledId)} />
              </div>
              <div className="flex-sub" style={{ flex: 1, textAlign: 'right' }}>
                {count}
              </div>
            </div>
          ))}
          <div className="flex">
            <div className="flex-sub value" style={{ flex: 3 }}>
              <Trans id="common.total">Total</Trans>
            </div>
            <div className="flex-sub value" style={{ flex: 1, textAlign: 'right' }}>
              {this.dispelCount}
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default DispelTracker;
