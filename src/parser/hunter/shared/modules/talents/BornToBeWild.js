import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import SPECS from 'game/SPECS';
import { formatNumber } from 'common/format';

/**
 * Reduces the cooldowns of Aspect of the Cheetah and Aspect of the Turtle by 20%.
 * For Survival it also reduces the cooldown of Aspect of the Eagle
 */

const BASELINE_TURTLE_CHEETAH_CD = 180000;
const BASELINE_EAGLE_CD = 90000;
const AFFECTED_SPELLS = [
  SPELLS.ASPECT_OF_THE_CHEETAH.id,
  SPELLS.ASPECT_OF_THE_TURTLE.id,
  SPELLS.ASPECT_OF_THE_EAGLE.id,
];

const debug = false;

class BornToBeWild extends Analyzer {

  _effectiveCheetahCDR = 0;
  _effectiveTurtleCDR = 0;
  _effectiveEagleCDR = 0;
  _lastCheetahCast = null;
  _lastTurtleCast = null;
  _lastEagleCast = null;
  hasEagle = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id);
    this.hasEagle = this.selectedCombatant.spec === SPECS.SURVIVAL_HUNTER;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!AFFECTED_SPELLS.includes(spellId)) {
      return;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_CHEETAH.id) {
      debug && console.log(event.timestamp, "Cheetah cast - time since last cast: ", this._lastCheetahCast ? (event.timestamp - this._lastCheetahCast) / 1000 : 'no previous cast');
      if (this._lastCheetahCast && event.timestamp < this._lastCheetahCast + BASELINE_TURTLE_CHEETAH_CD) {
        this._effectiveCheetahCDR += BASELINE_TURTLE_CHEETAH_CD - (event.timestamp - this._lastCheetahCast);
      }
      this._lastCheetahCast = event.timestamp;
      return;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_TURTLE.id) {
      debug && console.log(event.timestamp, "Turtle cast - time since last cast: ", this._lastTurtleCast ? (event.timestamp - this._lastTurtleCast) / 1000 : 'no previous cast');
      if (this._lastTurtleCast && event.timestamp < this._lastTurtleCast + BASELINE_TURTLE_CHEETAH_CD) {
        this._effectiveTurtleCDR += BASELINE_TURTLE_CHEETAH_CD - (event.timestamp - this._lastTurtleCast);
      }
      this._lastTurtleCast = event.timestamp;
      return;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_EAGLE.id) {
      debug && console.log(event.timestamp, "Eagle cast - time since last cast: ", this._lastEagleCast ? (event.timestamp - this._lastEagleCast) / 1000 : 'no previous cast');
      if (this._lastEagleCast && event.timestamp < this._lastEagleCast + BASELINE_EAGLE_CD) {
        this._effectiveEagleCDR += BASELINE_EAGLE_CD - (event.timestamp - this._lastEagleCast);
      }
      this._lastEagleCast = event.timestamp;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        icon={<SpellIcon id={SPELLS.BORN_TO_BE_WILD_TALENT.id} />}
        value={`${formatNumber((this._effectiveCheetahCDR + this._effectiveEagleCDR + this._effectiveTurtleCDR) / 1000)}s total effective CDR`}
        label="Born To Be Wild"
        tooltip={`Effective CDR constitutes the time that was left of the original CD (before reduction from Born To Be Wild) when you cast it again as that is the effective cooldown reduction it provided for you.
                <ul>
                  ${this.hasEagle ? `<li>Aspect of the Eagle: ${formatNumber(this._effectiveEagleCDR / 1000)}s</li>` : ``}
                  <li>Aspect of the Cheetah: ${formatNumber(this._effectiveCheetahCDR / 1000)}s</li>
                  <li>Aspect of the Turtle: ${formatNumber(this._effectiveTurtleCDR / 1000)}s</li>
                </ul>
       `} />
    );
  }
}

export default BornToBeWild;
