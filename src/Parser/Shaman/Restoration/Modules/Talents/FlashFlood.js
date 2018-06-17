import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

const FLASH_FLOOD_HASTE = 0.2;

// All heal spells with cast time...
const SPELLS_CONSUMING_FLASH_FLOOD = [
  SPELLS.HEALING_WAVE.id,
  SPELLS.CHAIN_HEAL.id,
  SPELLS.WELLSPRING_TALENT.id,
  SPELLS.HEALING_SURGE_RESTORATION.id, //-- always below GCD
  SPELLS.HEALING_RAIN_CAST.id,
];

class FlashFlood extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    globalCooldown: GlobalCooldown,
  };

  beginCastTimestamp = 0;
  timeSaved = 0;
  beginCastGlobalCooldown = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FLASH_FLOOD_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id);
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (!SPELLS_CONSUMING_FLASH_FLOOD.includes(spellId)) {
      return;
    }

    if(event.isCancelled) {
      return;
    }

    const hasFlashFlood = this.combatants.selected.hasBuff(SPELLS.FLASH_FLOOD_BUFF.id, event.timestamp);
    if(!hasFlashFlood) {
      return;
    }

    this.beginCastTimestamp = event.timestamp;
    this.beginCastGlobalCooldown = this.globalCooldown.getCurrentGlobalCooldown(spellId);
  }

  on_byPlayer_cast(event) {
    if(!this.beginCastTimestamp) {
      return;
    }
    
    const castTime = event.timestamp - this.beginCastTimestamp;
    if (castTime <= this.beginCastGlobalCooldown) {
      this.beginCastTimestamp = 0;
      return;
    }

    this.timeSaved += castTime / (1-FLASH_FLOOD_HASTE) * FLASH_FLOOD_HASTE;
    this.beginCastTimestamp = 0;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.FLASH_FLOOD_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Cast time saved by Flash Flood.`}>
            {(this.timeSaved / 1000).toFixed(2)} seconds
          </dfn>
        </div>
      </div>
    );
  }

}

export default FlashFlood;
