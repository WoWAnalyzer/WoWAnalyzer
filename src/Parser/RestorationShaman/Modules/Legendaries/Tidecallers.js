import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';


const HTT_BASE_DURATION = 10000;

class Tidecallers extends Module {
  healing = 0;
  httHealing = 0;
  hstHealing = 0;

  httDropped = null;
  currentTick = null;
  lastTick = null;
  firstTickAfterBaseDuration = null;


  on_initialized() {
    this.active = this.owner.selectedCombatant.hasHands(ITEMS.PRAETORIANS_TIDECALLERS.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const healingDone = event.amount + (event.absorbed || 0);

    if (spellId === SPELLS.HEALING_TIDE_TOTEM_HEAL.id) {

      if (this.currentTick) {
        if (!(this.currentTick === event.timestamp)) {
          this.lastTick = this.currentTick;
          this.currentTick = event.timestamp;
        }
      } else {
          this.currentTick = event.timestamp;
      }

      if (this.httDropped && (this.httDropped + HTT_BASE_DURATION) < event.timestamp) {
          if (!this.firstTickAfterBaseDuration) {
              this.firstTickAfterBaseDuration = event.timestamp;
          }

          // If this is a heal in the first tick after the base duration, subtract the partial tick that we
          // would have gotten if we were not using tidecallers.
          if (this.firstTickAfterBaseDuration === event.timestamp) {
            const partialTickDuration = (this.httDropped + HTT_BASE_DURATION) - this.lastTick;
            const fullTickDuration = event.timestamp - this.lastTick;
            const partialTickFraction = partialTickDuration / fullTickDuration; 
            this.httHealing -= healingDone * partialTickFraction;
          }

          this.httHealing += healingDone;
      }
    }

    if (spellId === SPELLS.HEALING_STREAM_TOTEM_HEAL.id || spellId === SPELLS.QUEENS_DECREE.id) {
        this.hstHealing += healingDone / 6; // only add the extra 20% we're getting
    }


  }

  on_byPlayer_cast(event) {

    const spellId = event.ability.guid;

    if (spellId === SPELLS.HEALING_TIDE_TOTEM_CAST.id) {
        this.httDropped = event.timestamp;
        this.firstTickAfterBaseDuration = null;
        this.currentTick = null;
        this.lastTick = null;
    } 
  }
}

export default Tidecallers;
