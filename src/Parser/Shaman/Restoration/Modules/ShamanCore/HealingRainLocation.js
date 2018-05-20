import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const healingRainEvents = [];
const healingRainDiameter = 2100; // 5% margin of error
let lastHealingRainTick = 0;

/**
 * Module to find the position of healing rain, and return how much extra healing spells modified by healing rain did.
 * 
 * The position is calculated by gathering all coordinates of people getting healed by rain, finding the extremes and treating it as an ellipse.
 * Player position on heal is then compared against that.
 */

class HealingRainLocation extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  newHealingRain = false;
  lastHealingRainTick = 0;

  on_initialized() {
    const hasDeluge = this.combatants.selected.hasTalent(SPELLS.DELUGE_TALENT.id);
    const hasRebalancers = this.combatants.selected.hasFeet(ITEMS.ELEMENTAL_REBALANCERS.id);
    this.active = hasDeluge || hasRebalancers;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_HEAL.id && spellId !== SPELLS.RAINFALL.id) {
      return;
    }

    // Pets with their insane movement speed (or blinking) messed the size up, so I decided to filter them out
    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      return;
    }

    if(this.newHealingRain) {
      healingRainEvents.length = 0;
      this.newHealingRain = false;
    }

    lastHealingRainTick = event.timestamp;
    healingRainEvents.push(event);
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id || event.isCancelled) {
      return;
    }

    // Setting a variable to reset the array on the next heal
    // If we'd reset here it would sometimes clear the array before the healing is calculated
    this.newHealingRain = true;
  }
}
export default HealingRainLocation;

export function processLastRain(eventsDuringRain, healIncrease) {
  let healing = 0;
  if(!healingRainEvents.length) {
    return healing;
  }
  const {minY, maxY, minX, maxX} = locate(healingRainEvents);
  const ellipseCenterPoint = {
    x: (maxX + minX) / 2,
    y: (maxY + minY) / 2,
  };
  const ellipseHeight = (maxX - minX);
  const ellipseWidth = (maxY - minY);

  // If there are erroneous data, it's better to not count the rain instead of having it overvalue the effect.
  if(ellipseHeight >= healingRainDiameter || ellipseWidth >= healingRainDiameter) {
    console.warn(
      'Reported Healing Rain size is too large, something went wrong.', 
      'Allowed Size:', healingRainDiameter, 
      'Reported Height:', ellipseHeight, 
      'Reported Width:', ellipseWidth
    );
    return healing;
  }

  eventsDuringRain.filter(event => event.timestamp <= lastHealingRainTick).forEach((event) => {
    const pointToCheck = {x: event.x, y: event.y};
    if(_isPlayerInsideHealingRain(pointToCheck, ellipseCenterPoint, ellipseHeight, ellipseWidth)) {
      healing += calculateEffectiveHealing(event, healIncrease);
    }
  });

  return healing;
}

function locate(events) {
  return events.reduce((result, event) => {
    result.minY = Math.min(event.y, result.minY);
    result.maxY = Math.max(event.y, result.maxY);
    result.minX = Math.min(event.x, result.minX);
    result.maxX = Math.max(event.x, result.maxX);
    return result;
  }, {minY: Number.MAX_VALUE, maxY: -Number.MAX_VALUE, minX: Number.MAX_VALUE, maxX: -Number.MAX_VALUE});
}

// also called: is point inside ellipse
function _isPlayerInsideHealingRain(pointToCheck, ellipseCenterPoint, ellipseHeight, ellipseWidth) {
  const xComponent = (Math.pow(pointToCheck.x - ellipseCenterPoint.x, 2) / Math.pow(ellipseWidth, 2));
  const yComponent = (Math.pow(pointToCheck.y - ellipseCenterPoint.y, 2) / Math.pow(ellipseHeight, 2));

  if ((xComponent + yComponent) <= 1) {
    return true;
  }
  return false;
}
