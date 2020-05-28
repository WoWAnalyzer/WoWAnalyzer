import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

const debug = false;

class DispelTracker extends Analyzer {
  dispelEvents = {};
  dispelCount = 0;

  blackList = [
    SPELLS.WINDWALKING.id,
  ];

  on_dispel(event) {
    if (!this.owner.byPlayer(event)) {
      return;
    }
    const spellId = event.extraAbility.guid;

    if(this.blackList.includes(spellId)){
      return;
    }

    const abilityDispelled = event.extraAbility;
    if (!this.dispelEvents[abilityDispelled.guid]) {
      this.dispelEvents[abilityDispelled.guid] = 1;
    } else {
      this.dispelEvents[abilityDispelled.guid] += 1;
    }

    if (!SPELLS[abilityDispelled.guid]) {
      // The spells need to be defined so the view doesn't crash
      SPELLS[abilityDispelled.guid] = {
        id: abilityDispelled.guid,
        name: abilityDispelled.name,
        icon: abilityDispelled.abilityIcon.replace('.jpg', ''),
      };
    }

    this.dispelCount += 1;
  }

  statistic() {
    if (!this.dispelCount) {
      debug && console.log('DispelTracker: This player did not dispel anything during this fight; this can have multiple reasons.');
      return null;
    }

    debug && console.log('DispelTracker: All events', this.dispelEvents);
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(1)}>
        <div className="pad">
          <label>
            Dispells
          </label>
          {Object.keys(this.dispelEvents).map(key => (
            <div className="flex" key={key}>
              <div className="flex-sub" style={{ flex: 3 }}><SpellLink id={Number(key)} /></div>
              <div className="flex-sub" style={{ flex: 1, textAlign: 'right' }}>{this.dispelEvents[key]}</div>
            </div>
          ))}
          <div className="flex">
            <div className="flex-sub value" style={{ flex: 3 }}>Total</div>
            <div className="flex-sub value" style={{ flex: 1, textAlign: 'right' }}>{this.dispelCount}</div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default DispelTracker;
