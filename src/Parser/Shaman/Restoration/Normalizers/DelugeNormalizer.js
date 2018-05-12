import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

/*
* this is always active, fix?
 */
const rainCoordinates = [];

class DelugeNormalizer extends EventsNormalizer {

  coordinates = [[]];
  castNumber = 0;

  normalize(events) {
    rainCoordinates.length = 0; // clearing the array to prevent this bugging out when switching between fights
    this.playerID = this.owner.playerId;
    this.coordinates[0] = []; // 0 is used if healing rain was casted before the fight started
    events.forEach((event) => {
      if (event.type === 'begincast' && event.ability.guid === SPELLS.HEALING_RAIN_CAST.id && !event.isCancelled) {
        this.castNumber += 1;
        this.coordinates[this.castNumber] = [];
      }
      if (event.type === 'heal' && event.ability.guid === SPELLS.HEALING_RAIN_HEAL.id && event.sourceID === this.playerID) {
        this.coordinates[this.castNumber].push({
          x: event.x,
          y: event.y,
        });
      }
    });
    this.coordinates.forEach((cast, castIndex) => {
      // find out highest and lowest X and Y
      cast.forEach((coordinate) => {
        if(!rainCoordinates[castIndex]) {
          rainCoordinates[castIndex] = {
            lowX: coordinate.x,
            lowY: coordinate.y,
            highX: coordinate.x,
            highY: coordinate.y,
          };
        }

        if(coordinate.x < rainCoordinates[castIndex].lowX) {
          rainCoordinates[castIndex].lowX = coordinate.x;
        }
        if(coordinate.x > rainCoordinates[castIndex].highX) {
          rainCoordinates[castIndex].highX = coordinate.x;
        }
        if(coordinate.y < rainCoordinates[castIndex].lowY) {
          rainCoordinates[castIndex].lowY = coordinate.y;
        }
        if(coordinate.y > rainCoordinates[castIndex].highY) {
          rainCoordinates[castIndex].highY = coordinate.y;
        }
      });
      
      /*rainCoordinates[castIndex] && console.log(_isPointInsideEllipse(
        {
          x: 136433,
          y: -370932,
        },
        {
          x: (rainCoordinates[castIndex].highX + rainCoordinates[castIndex].lowX) / 2,
          y: (rainCoordinates[castIndex].highY + rainCoordinates[castIndex].lowY) / 2,
        },
        (rainCoordinates[castIndex].highX - rainCoordinates[castIndex].lowX),
        (rainCoordinates[castIndex].highY - rainCoordinates[castIndex].lowY)
        ), 
        (rainCoordinates[castIndex].highX + rainCoordinates[castIndex].lowX) / 2,
        (rainCoordinates[castIndex].highY + rainCoordinates[castIndex].lowY) / 2,
        (rainCoordinates[castIndex].highX - rainCoordinates[castIndex].lowX),
        (rainCoordinates[castIndex].highY - rainCoordinates[castIndex].lowY)
      );*/
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
  if(!rainCoordinates[index]) { // this happens if the start of combat check goes through but there wasn't a pre-combat rain
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
