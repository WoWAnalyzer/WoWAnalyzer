import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

class MaelstromTracker extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  lastEventTimestamp = 0;
  maelstromBySecond = [];
  activeMaelstromWasted = {};
  activeMaelstromWastedTimeline = {};
  generatorCasts = {};
  activeMaelstromGenerated = {};
  tracker = 0; //to tell if any prop has updated, since we can't compare arrays
  _maxMaelstrom = 0;

  on_initialized() {
    this.lastEventTimestamp = this.owner.fight.start_time;
    this.secondsCapped = 0;
  }

  on_byPlayer_energize(event) {
    this.checkActiveWaste(event);
  }
  on_toPlayer_energize(event) {
    this.checkActiveWaste(event);
  }

  checkForMaxMaelstrom(event) {
    if (event.sourceID === this.owner.player.id) {
      event.classResources.forEach(classResource => {
        if (classResource.type === RESOURCE_TYPES.MAELSTROM.id && classResource['max'] > this._maxMaelstrom) {
          //note: this works for now, but may not work if max focus becomes changable mid-fight, then max would have to be calculated on an event-by-event basis
          this._maxMaelstrom = classResource['max'];
        }
      });
    }
  }

  checkForError(secIntoFight) {
    if (this.maelstromBySecond[secIntoFight] - this._maxMaelstrom > 0) {
      this.maelstromBySecond[secIntoFight] = Math.floor(this.maelstromBySecond[secIntoFight]);
    }
  }

  checkActiveWaste(event) {
    if ((event.sourceID === this.owner.player.id || event.targetID === this.owner.player.id) && event.classResources && event.classResources[0].type === RESOURCE_TYPES.MAELSTROM) {
      this.tracker++;
      if (this.generatorCasts[event.ability.guid]) {
        this.generatorCasts[event.ability.guid]++;
      }
      else {
        this.generatorCasts[event.ability.guid] = 1;
      }
      if (this.activeMaelstromGenerated[event.ability.guid]) {
        this.activeMaelstromGenerated[event.ability.guid] += event.resourceChange;
      }
      else {
        this.activeMaelstromGenerated[event.ability.guid] = event.resourceChange;
      }
      if (event.waste > 0) {
        if (this.activeMaelstromWasted[event.ability.guid]) {
          this.activeMaelstromWasted[event.ability.guid] += event.waste;
        }
        else {
          this.activeMaelstromWasted[event.ability.guid] = event.waste;
        }

        if (this.activeMaelstromWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)]) {
          this.activeMaelstromWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)] += event.waste;
        }
        else {
          this.activeMaelstromWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)] = event.waste;
        }
      }
    }
  }

}

export default MaelstromTracker;

