import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Umbral Moonglaives -
 * Use: Conjure a storm of glaives at your location, causing 125220 Arcane damage every 1 sec to nearby enemies. After 8 sec the glaives shatter, causing another 313052 Arcane damage to enemies in the area. (1 Min, 30 Sec Cooldown)
 */
class UmbralMoonglaives extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  casts = 0;

  ticks = 0;
  tickHits = 0;

  shatters = 0;
  shatterHits = 0;


  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.UMBRAL_MOONGLAIVES.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.UMBRAL_GLAIVE_STORM_CAST.id) {
      this.casts += 1;
    } else if (spellId === SPELLS.UMBRAL_GLAIVE_STORM_TICK.id) { // each tick procs a cast event for player
      this.ticks += 1;
      this.lastTickTimestamp = event.timestamp;
    } else if (spellId === SPELLS.SHATTERING_UMBRAL_GLAIVES.id) { // each shatter procs a cast event for player
      this.shatters += 1; // should be same number as casts, but just in case fight ends after cast but before shatter
      this.lastShatterTimestamp = event.timestamp;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.UMBRAL_GLAIVE_STORM_TICK.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.tickHits += 1;
    } else if (spellId === SPELLS.SHATTERING_UMBRAL_GLAIVES.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.shatterHits += 1;
    }
  }

  get averageHitsPerTick() {
    return this.tickHits / this.ticks;
  }

  get averageHitsPerShatter() {
    return this.shatterHits / this.shatters;
  }

  item() {
    return {
      item: ITEMS.UMBRAL_MOONGLAIVES,
      result: (
        <dfn data-tip={`Glaive Storm ticks hit an average of <b>${this.averageHitsPerTick.toFixed(1)}</b> targets.<br>
        Glaive Shatters hit an average of <b>${this.averageHitsPerShatter.toFixed(1)}</b> targets.`}>
          {this.owner.formatItemDamageDone(this.damage)}
        </dfn>
      ),
    };
  }
}

export default UmbralMoonglaives;
