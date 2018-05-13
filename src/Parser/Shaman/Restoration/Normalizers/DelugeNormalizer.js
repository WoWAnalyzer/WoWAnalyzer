import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

/*
* this is always active, fix?
* it has an instant tick on cast and a partial tick when it fades
 */
const rainCoordinates = [];

class DelugeNormalizer extends EventsNormalizer {

  castNumber = 0; // 0 is used if healing rain was casted before the fight started

  normalize(events) {
    rainCoordinates.length = 0; // clearing the array to prevent this bugging out when switching between fights
    this.playerID = this.owner.playerId;
    events.filter(event => event.ability && (event.ability.guid === SPELLS.HEALING_RAIN_HEAL.id || event.ability.guid === SPELLS.HEALING_RAIN_CAST.id)).forEach((event) => {
      if (event.type === 'begincast' && !event.isCancelled) {
        this.castNumber += 1;
      }
      if (event.type === 'heal' && event.sourceID === this.playerID) {
        if(!rainCoordinates[this.castNumber]) {
          rainCoordinates[this.castNumber] = {
            start: event.timestamp,
            lowX: event.x,
            lowY: event.y,
            highX: event.x,
            highY: event.y,
          };
        }

        if(event.x < rainCoordinates[this.castNumber].lowX) {
          rainCoordinates[this.castNumber].lowX = event.x;
        }
        if(event.x > rainCoordinates[this.castNumber].highX) {
          rainCoordinates[this.castNumber].highX = event.x;
        }
        if(event.y < rainCoordinates[this.castNumber].lowY) {
          rainCoordinates[this.castNumber].lowY = event.y;
        }
        if(event.y > rainCoordinates[this.castNumber].highY) {
          rainCoordinates[this.castNumber].highY = event.y;
        }
      }
    });

    return events;
  }
}
export default DelugeNormalizer;

function _isPointInsideEllipse(pointToCheck, ellipseCenterPoint, ellipseHeight, ellipseWidth) {
  const xComponent = (Math.pow(pointToCheck.x - ellipseCenterPoint.x, 2) / Math.pow(ellipseWidth, 2));
  const yComponent = (Math.pow(pointToCheck.y - ellipseCenterPoint.y, 2) / Math.pow(ellipseHeight, 2));

  if ((xComponent + yComponent) <= 1) {
    return true;
  }
  return false;
}

export function _isPlayerInsideHealingRain(event, index) {
  if(!rainCoordinates[index]) { // this happens if the start of combat condition goes through but there wasn't a pre-combat rain
    return false;
  }
  return _isPointInsideEllipse(
    {x: event.x, y: event.y},
    {
      x: (rainCoordinates[index].highX + rainCoordinates[index].lowX) / 2,
      y: (rainCoordinates[index].highY + rainCoordinates[index].lowY) / 2,
    },
    (rainCoordinates[index].highX - rainCoordinates[index].lowX),
    (rainCoordinates[index].highY - rainCoordinates[index].lowY)
  );
}
