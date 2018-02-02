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
  cheetahCastTime = 0;
  eagleCastTime = 0;
  turtleCastTime = 0;
  wildCastTime = 0;

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
      this.eagleCDR += BASE_EAGLE_COOLDOWN * COTW_CDR;
      this.eagleCastTime = event.timestamp;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_CHEETAH.id) {
      this.cheetahCDR += BASE_CHEETAH_COOLDOWN * COTW_CDR;
      this.cheetahCastTime = event.timestamp;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_TURTLE.id) {
      this.turtleCDR += BASE_TURTLE_COOLDOWN * COTW_CDR;
      this.turtleCastTime = event.timestamp;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_WILD.id) {
      this.wildCDR += BASE_WILD_COOLDOWN * COTW_CDR;
      this.wildCastTime = event.timestamp;
    }
  }

  on_finished() {
    //checks if any given ability was cast at a point in the fight where the CDR granted by the bracers doesn't allow for another cast, in which case the CDR is ineffective
    if (this.eagleCastTime > (this.owner.fight.end_time - this.eagleCooldownWithBracers && this.eagleCDR > 0)) {
      this.eagleCDR -= BASE_EAGLE_COOLDOWN * COTW_CDR;
    }
    if (this.cheetahCastTime > (this.owner.fight.end_time - this.cheetahCooldownWithBracers && this.cheetahCDR > 0)) {
      this.cheetahCDR -= BASE_CHEETAH_COOLDOWN * COTW_CDR;
    }
    if (this.turtleCastTime > (this.owner.fight.end_time - this.turtleCooldownWithBracers && this.turtleCDR > 0)) {
      this.turtleCDR -= BASE_TURTLE_COOLDOWN * COTW_CDR;
    }
    if (this.wildCastTime > (this.owner.fight.end_time - this.wildCooldownWithBracers && this.wildCDR > 0)) {
      this.wildCDR -= BASE_WILD_COOLDOWN * COTW_CDR;
    }
  }

  item() {
    let tooltipText = `This shows a breakdown of the cooldown reduction provided by Call of the Wild: <br/> We only count CDR that was effective, so if you spend a cast near the end of the fight where you won't be getting a new cast no matter what, we don't count that as CDR. <ul>`;
    tooltipText += (this.eagleCDR > 0) ? `<li>Aspect of the Eagle</li><ul><li>Total CDR: ${this.eagleCDR / 1000} seconds</li><li>Gained casts: ${(this.eagleCDR / BASE_EAGLE_COOLDOWN).toFixed(1)}</li></ul>` : ``;
    tooltipText += (this.cheetahCDR > 0) ? `<li>Aspect of the Cheetah</li><ul><li>Total CDR: ${this.cheetahCDR / 1000} seconds</li><li>Gained casts: ${(this.cheetahCDR / BASE_CHEETAH_COOLDOWN).toFixed(1)}</li></ul>` : ``;
    tooltipText += (this.turtleCDR > 0) ? `<li>Aspect of the Turtle</li><ul><li>Total CDR: ${this.turtleCDR / 1000} seconds</li><li>Gained casts: ${(this.turtleCDR / BASE_TURTLE_COOLDOWN).toFixed(1)}</li></ul>` : ``;
    tooltipText += (this.wildCDR > 0) ? `<li>Aspect of the Wild</li><ul><li>Total CDR: ${this.wildCDR / 1000} seconds</li><li>Gained casts: ${(this.wildCDR / BASE_WILD_COOLDOWN).toFixed(1)}</li></ul>` : ``;
    tooltipText += `</ul>`;
    return {
      item: ITEMS.CALL_OF_THE_WILD,
      result: (
        <dfn data-tip={tooltipText}>
          This reduced the cooldown of all your Aspect spells by 35%
        </dfn>
      ),
    };
  }
}

export default CallOfTheWild;
