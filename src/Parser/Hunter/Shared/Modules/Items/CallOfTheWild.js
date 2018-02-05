import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/HUNTER';

/**
 * Call of the Wild
 * Equip: Reduces the cooldown of all Aspects by 35%.
 */
const LIST_OF_ASPECTS = [
  SPELLS.ASPECT_OF_THE_EAGLE.id,
  SPELLS.ASPECT_OF_THE_CHEETAH.id,
  SPELLS.ASPECT_OF_THE_TURTLE.id,
  SPELLS.ASPECT_OF_THE_WILD.id,
];

const EMBRACE_CDR = 0.2;
const PATHFINDER_CDR = 1 / 3;
const COTW_CDR = 0.35;

let BASE_EAGLE_COOLDOWN = 120000;
let BASE_CHEETAH_COOLDOWN = 180000;
let BASE_TURTLE_COOLDOWN = 180000;
const BASE_WILD_COOLDOWN = 120000;

class CallOfTheWild extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  //used later when I set their CDs with the bracers equipped
  eagleCooldownWithBracers = 0;
  cheetahCooldownWithBracers = 0;
  turtleCooldownWithBracers = 0;
  wildCooldownWithBracers = 0;

  //total CDR variables
  eagleCDR = 0;
  cheetahCDR = 0;
  turtleCDR = 0;
  wildCDR = 0;

  //cast time variables
  lastCheetahCastTime = 0;
  lastEagleCastTime = 0;
  lastTurtleCastTime = 0;
  lastWildCastTime = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
    //handles preemptively lowered cooldown if the SV player has this trait
    if (this.combatants.selected.traitsBySpellId[SPELLS.EMBRACE_OF_THE_ASPECTS.id]) {
      BASE_EAGLE_COOLDOWN *= (1 - EMBRACE_CDR);
      BASE_CHEETAH_COOLDOWN *= (1 - EMBRACE_CDR);
      BASE_TURTLE_COOLDOWN *= (1 - EMBRACE_CDR);
    }
    //handles preemptively lowered cooldown if the BM player has this trait
    if (this.combatants.selected.traitsBySpellId[SPELLS.PATHFINDER_TRAIT.id]) {
      BASE_CHEETAH_COOLDOWN *= (1 - PATHFINDER_CDR);
    }
    this.eagleCooldownWithBracers = BASE_EAGLE_COOLDOWN * (1 - COTW_CDR);
    this.cheetahCooldownWithBracers = BASE_CHEETAH_COOLDOWN * (1 - COTW_CDR);
    this.turtleCooldownWithBracers = BASE_TURTLE_COOLDOWN * (1 - COTW_CDR);
    this.wildCooldownWithBracers = BASE_WILD_COOLDOWN * (1 - COTW_CDR);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!LIST_OF_ASPECTS.includes(spellId)) {
      return;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_EAGLE.id) {
      if (this.lastEagleCastTime && BASE_EAGLE_COOLDOWN > (event.timestamp - this.lastEagleCastTime)) {
        this.eagleCDR += Math.max((BASE_EAGLE_COOLDOWN - (event.timestamp - this.lastEagleCastTime)), 0);
      }
      this.lastEagleCastTime = event.timestamp;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_CHEETAH.id) {
      if (this.lastCheetahCastTime && BASE_CHEETAH_COOLDOWN > (event.timestamp - this.lastCheetahCastTime)) {
        this.cheetahCDR += Math.max((BASE_CHEETAH_COOLDOWN - (event.timestamp - this.lastCheetahCastTime)), 0);

      }
      this.lastCheetahCastTime = event.timestamp;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_TURTLE.id) {
      if (this.lastTurtleCastTime && BASE_TURTLE_COOLDOWN > (event.timestamp - this.lastTurtleCastTime)) {
        this.turtleCDR += Math.max((BASE_TURTLE_COOLDOWN - (event.timestamp - this.lastTurtleCastTime)), 0);
      }
      this.lastTurtleCastTime = event.timestamp;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_WILD.id) {
      if (this.lastWildCastTime && BASE_WILD_COOLDOWN > (event.timestamp - this.lastWildCastTime)) {
        this.wildCDR += Math.max((BASE_WILD_COOLDOWN - (event.timestamp - this.lastWildCastTime)), 0);
      }
      this.lastWildCastTime = event.timestamp;
    }
  }

  item() {
    let tooltipText = `This shows a breakdown of the cooldown reduction provided by Call of the Wild: <br/> We only count CDR that was effective, meaning we are only showing the time between your casts that happened too soon after your last cast than would have been possible without Call of the Wild equipped.<ul>`;
    tooltipText += (this.eagleCDR > 0) ? `<li>Aspect of the Eagle</li><ul><li>Total CDR: ${(this.eagleCDR / 1000).toFixed(1)} seconds</li><li>Gained casts: ${(this.eagleCDR / BASE_EAGLE_COOLDOWN).toFixed(1)}</li></ul>` : ``;
    tooltipText += (this.cheetahCDR > 0) ? `<li>Aspect of the Cheetah</li><ul><li>Total CDR: ${(this.cheetahCDR / 1000).toFixed(1)} seconds</li><li>Gained casts: ${(this.cheetahCDR / BASE_CHEETAH_COOLDOWN).toFixed(1)}</li></ul>` : ``;
    tooltipText += (this.turtleCDR > 0) ? `<li>Aspect of the Turtle</li><ul><li>Total CDR: ${(this.turtleCDR / 1000).toFixed(1)} seconds</li><li>Gained casts: ${(this.turtleCDR / BASE_TURTLE_COOLDOWN).toFixed(1)}</li></ul>` : ``;
    tooltipText += (this.wildCDR > 0) ? `<li>Aspect of the Wild</li><ul><li>Total CDR: ${(this.wildCDR / 1000).toFixed(1)} seconds</li><li>Gained casts: ${(this.wildCDR / BASE_WILD_COOLDOWN).toFixed(1)}</li></ul>` : ``;
    tooltipText += `</ul>`;
    return {
      item: ITEMS.CALL_OF_THE_WILD,
      result: (
        <dfn data-tip={(this.eagleCDR + this.cheetahCDR + this.turtleCDR + this.wildCDR) > 0 ? tooltipText : `You didn't gain any effective cooldown reduction from having the bracers equipped.`}>
          This reduced the cooldown of all your Aspect spells by 35%
        </dfn>
      ),
    };
  }
}

export default CallOfTheWild;
