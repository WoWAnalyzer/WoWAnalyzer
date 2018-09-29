import Analyzer from 'parser/core/Analyzer';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';

class MaelstromTracker extends Analyzer {
  lastEventTimestamp = 0;
  maelstromBySecond = [];
  activeMaelstromWasted = {};
  activeMaelstromWastedTimeline = {};
  generatorCasts = {};
  activeMaelstromGenerated = {};
  tracker = 0; //to tell if any prop has updated, since we can't compare arrays
  _maxMaelstrom = 0;

  constructor(...args) {
    super(...args);
    this.lastEventTimestamp = this.owner.fight.start_time;
  }

  on_finished() {
    this.extrapolateFocus(this.owner.currentTimestamp);
  }

  on_toPlayer_energize(event) {
    this.checkActiveWaste(event);
  }

  on_byPlayer_cast(event) {
    this.checkPassiveWaste(event);
  }

  on_toPlayer_damage(event) {
    this.checkPassiveWaste(event);
  }

  on_toPlayer_heal(event) {
    this.checkPassiveWaste(event);
  }

  on_byPlayer_heal(event) {
    this.checkPassiveWaste(event);
  }

  checkPassiveWaste(event) {
    if ((event.sourceID === this.owner.player.id || event.targetID === this.owner.player.id) && event.classResources && event.classResources[0].type === RESOURCE_TYPES.FOCUS.id) {
      this.tracker += 1;
      this.checkForMaxMaelstrom(event);
      if (event.classResources[0].cost) {
        this.maelstromBySecond[event.timestamp - this.owner.fight.start_time] = event.classResources[0].amount - event.classResources.cost;
      } else {
        this.maelstromBySecond[event.timestamp - this.owner.fight.start_time] = event.classResources[0].amount;
      }
    }

    this.extrapolateFocus(event.timestamp);
  }

  checkForMaxMaelstrom(event) {
    if (event.sourceID === this.owner.player.id) {
      event.classResources.forEach(classResource => {
        if (classResource.type === RESOURCE_TYPES.MAELSTROM.id && classResource.max > this._maxMaelstrom) {
          //note: this works for now, but may not work if max focus becomes changable mid-fight, then max would have to be calculated on an event-by-event basis
          this._maxMaelstrom = classResource.max;
        }
      });
    }
  }

  checkActiveWaste(event) {
    if (event.sourceID !== this.owner.player.id && event.targetID !== this.owner.player.id) {
      return;
    }
    const maelstrom = event.classResources && event.classResources.find(resource => resource.type === RESOURCE_TYPES.MAELSTROM.id);
    if (!maelstrom) {
      return;
    }

    this.tracker += 1;
    this.checkForMaxMaelstrom(event);
    this.maelstromBySecond[(event.timestamp - this.owner.fight.start_time)] = event.classResources[0].amount;
    if (this.generatorCasts[event.ability.guid]) {
      this.generatorCasts[event.ability.guid] += 1;
    } else {
      this.generatorCasts[event.ability.guid] = 1;
    }
    if (!SPELLS[event.ability.guid]) {
      // The spells need to be defined so the Maelstrom view doesn't crash, this should be taken care off by the developer (you), but this at least prevents crashes.
      console.error('Maelstrom generator missing in SPELLS!', event.ability);
      SPELLS[event.ability.guid] = {
        id: event.ability.guid,
        name: event.ability.name,
        icon: event.ability.abilityIcon.replace('.jpg', ''),
      };
    }
    if (this.activeMaelstromGenerated[event.ability.guid]) {
      this.activeMaelstromGenerated[event.ability.guid] += event.resourceChange;
    } else {
      this.activeMaelstromGenerated[event.ability.guid] = event.resourceChange;
    }
    if (event.waste > 0) {
      if (this.activeMaelstromWasted[event.ability.guid]) {
        this.activeMaelstromWasted[event.ability.guid] += event.waste;
      } else {
        this.activeMaelstromWasted[event.ability.guid] = event.waste;
      }

      if (this.activeMaelstromWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)]) {
        this.activeMaelstromWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)] += event.waste;
      } else {
        this.activeMaelstromWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)] = event.waste;
      }
    }
  }

  extrapolateFocus(eventTimestamp) {
    this.maelstromBySecond[0] = 0;
    for (let i = this.lastEventTimestamp - this.owner.fight.start_time; i < (eventTimestamp - this.owner.fight.start_time); i++) {
      if (!this.maelstromBySecond[i]) {
        this.maelstromBySecond[i] = this.maelstromBySecond[i - 1];
      }
    }
    this.lastEventTimestamp = eventTimestamp;
  }
}

export default MaelstromTracker;
