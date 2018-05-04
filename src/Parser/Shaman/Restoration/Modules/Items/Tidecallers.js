import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Main/ItemHealingDone';

const HTT_BASE_DURATION = 10000;

class Tidecallers extends Analyzer {
  httHealing = 0;
  hstHealing = 0;

  httDropped = null;
  currentTick = null;
  lastTick = null;
  firstTickAfterBaseDuration = null;


  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasHands(ITEMS.PRAETORIANS_TIDECALLERS.id);
  }

  on_heal(event) {
    if (!this.owner.byPlayer(event) && !this.owner.byPlayerPet(event)) {
      return;
    }

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

    if (spellId === SPELLS.HEALING_STREAM_TOTEM_HEAL.id) {
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

  item() {
    const healing = this.httHealing + this.hstHealing;

    const tidecallersHSTPercentage = this.owner.getPercentageOfTotalHealingDone(this.hstHealing);
    const tidecallersHTTPercentage = this.owner.getPercentageOfTotalHealingDone(this.httHealing);

    return {
      item: ITEMS.PRAETORIANS_TIDECALLERS,
      result: (
        <dfn data-tip={`The healing gained from the extra duration that Praetorian's Tidecallers give to Healing Tide Totem and Healing Stream Totem. The increased duration on Healing Stream Totem accounts for ${formatPercentage(tidecallersHSTPercentage)}% healing, the increased duration on Healing Tide Totem for ${formatPercentage(tidecallersHTTPercentage)}% healing.`}>
          <ItemHealingDone amount={healing} />
        </dfn>
      ),
    };
  }
}

export default Tidecallers;
