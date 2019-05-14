import React from "react";
import Analyzer from "parser/core/Analyzer";
import Statistic from "interface/statistics/Statistic";
import STATISTIC_ORDER from "interface/others/STATISTIC_ORDER";
import SpellLink from "common/SpellLink";

const debug = false;

class DispelTracker extends Analyzer {
  dispelEvents = {};
  dispelCount = 0;
  on_dispel(event) {
    if (!this.owner.byPlayer(event)) {
      return;
    }

    const spellDispelled = event.extraAbility.guid;
    if (!this.dispelEvents[spellDispelled]) {
      this.dispelEvents[spellDispelled] = 1;
    } else {
      this.dispelEvents[spellDispelled]++;
    }

    this.dispelCount++;
  }

  statistic() {
    if (!this.dispelCount) {
      debug && console.log("DispelTracker: This player did not dispel anything during this fight; this can have multiple reasons.");
      return null;
    }

    debug && console.log("DispelTracker: All events", this.dispelEvents);
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(1)}>
        <div className="pad">
          <label>
            Dispells
          </label>
          {Object.keys(this.dispelEvents).map(key => {
            return (
            <div className="flex">
              <div className="flex-sub" style={{flex: 3}}><SpellLink id={key} /></div>
              <div className="flex-sub" style={{flex: 1, textAlign: "right"}}>{this.dispelEvents[key]}</div>
            </div>
            );
          })}
          <div className="flex">
            <div className="flex-sub value" style={{ flex: 3 }}>Total</div>
            <div className="flex-sub value" style={{ flex: 1, textAlign: "right" }}>{this.dispelCount}</div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default DispelTracker;
