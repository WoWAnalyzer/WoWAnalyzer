import Module from 'Parser/Core/Module';

import Combatants from 'Parser/Core/Modules/Combatants';
import Haste from 'Parser/Core/Modules/Haste';

class DynamicHaste extends Module {
  static dependencies = {
    combatants: Combatants,
    haste: Haste,
  };

  _hasteLog = [];
  on_initialized() {
    const baseHaste = this.combatants.selected.hastePercentage;
    this.recordHasteChange(baseHaste, this.owner.fight.start_time);
  }

  on_changehaste(event) {
    this.recordHasteChange(event.newHaste, this.owner.currentTimestamp);
  }

  recordHasteChange(newHaste, timestamp) {
    if (this._hasteLog.length === 0) {
      this._hasteLog.push({ timestamp, haste: newHaste });
    }

    const lastHasteIndex = this._hasteLog.length - 1;
    const lastHaste = this._hasteLog[lastHasteIndex];

    if (lastHaste.timestamp === timestamp) {
      // If the haste change occured simultaneously with another haste change,
      // treat it as a single change
      this._hasteLog[lastHasteIndex].haste = newHaste;
    }

    if (lastHaste.haste !== newHaste) {
      // Conversely, only record a haste change if the values are actually different
      this._hasteLog.push({ timestamp, haste: newHaste });
    }
  }

  isHastedAbilityOffCooldown(lastCast, timestamp, baseCD) {
    /**
     * General algorithm:
     *
     * find haste value at time of last cast
     * while the next haste change is < timestamp:
     *  time at that haste value = next haste change - last haste value
     *  effectiveReduction = time at haste value * haste value
     *  baseCD -= effectiveReduction
     *  if (baseCD < 0) return true
     *
     * do ^ one more time to account for partial haste value
     *
     * return false if spell is still on cd
     */
    let remainingCD = baseCD * 1000;
    let hasteAtCastIndex = this._hasteLog.findIndex(({ timestamp }) => timestamp > lastCast);
    if (hasteAtCastIndex === -1) {
      hasteAtCastIndex = this._hasteLog.length - 1;
    }
    let nextHasteChange = hasteAtCastIndex + 1;
    do {
      let hasteEnd = timestamp;
      if (nextHasteChange < this._hasteLog.length) {
        hasteEnd = Math.min(timestamp, this._hasteLog[nextHasteChange].timestamp);
      }

      const hasteStart = Math.max(lastCast, this._hasteLog[hasteAtCastIndex].timestamp);

      const durationOfHaste = hasteEnd - hasteStart;
      const effectiveReduction = durationOfHaste * (1 + this._hasteLog[hasteAtCastIndex].haste);
      remainingCD -= effectiveReduction;
      if (remainingCD < 0) {
        return true;
      }
      hasteAtCastIndex += 1;
      nextHasteChange += 1;
    } while(hasteAtCastIndex < this._hasteLog.length);

    return false;
  }
}

export default DynamicHaste;
