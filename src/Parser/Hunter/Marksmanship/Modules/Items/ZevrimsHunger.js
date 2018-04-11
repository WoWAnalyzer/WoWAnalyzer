import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

/**
 * Zevrim's Hunger
 * Equip: Marked Shot has a 15% chance to not remove Hunter's Mark.
 */
const MS_BUFFER = 750;

const PROC_CHANCE = 0.15;

const APPLICATORS = [SPELLS.ARCANE_SHOT.id, SPELLS.SIDEWINDERS_TALENT.id, SPELLS.SIDEWINDERS_CAST.id, SPELLS.MULTISHOT.id];

const debug = false;

class ZevrimsHunger extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  casts = 0;
  procs = 0;
  lastHitTimestamp = 0;
  hasProcced = false;
  wastedProc = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.ZEVRIMS_HUNGER.id);
  }

  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    if (this.hasProcced && this.combatants.selected.hasBuff(SPELLS.MARKING_TARGETS.id) && APPLICATORS.includes(spellID)) {
      this.wastedProc++;
      debug && console.log("there was a wasted proc at timestamp: ", event.timestamp);
      this.hasProcced = false;
    }
    if (spellID === SPELLS.MARKED_SHOT.id) {
      this.casts++;
    }
  }

  on_byPlayer_removedebuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.HUNTERS_MARK_DEBUFF.id) {
      return;
    }
    this.hasProcced = false;
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    const enemy = this.enemies.getEntity(event);
    if (spellID !== SPELLS.MARKED_SHOT_DAMAGE.id || !enemy) {
      return;
    }
    if (enemy.hasBuff(SPELLS.HUNTERS_MARK_DEBUFF.id, event.timestamp) && this.lastHitTimestamp + MS_BUFFER < event.timestamp) {
      this.lastHitTimestamp = event.timestamp;
      this.procs++;
      this.hasProcced = true;
    }
  }

  item() {
    return {
      item: ITEMS.ZEVRIMS_HUNGER,
      result: (
        <dfn data-tip={`You could expect it to proc ${(this.casts * PROC_CHANCE).toFixed(2)} times.<br />`}>
          you utilized {this.procs - this.wastedProc} / {this.procs} {this.procs > 1 ? `procs` : `proc`}
        </dfn>
      ),
    };
  }
}

export default ZevrimsHunger;
