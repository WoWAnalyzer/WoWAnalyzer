import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

class FocusTracker extends Module {

  static dependencies = {
    combatants: Combatants,
  }

  focusBySecond = [];
  activeFocusWasted = {};
  activeFocusWastedTimeline = {};
  generatorCasts = {};
  activeFocusGenerated = {};
  tracker = 0; //to tell if any prop has updated, since we can't compare arrays
  _maxFocus = 0;

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

  on_byPlayer_energize(event) {
    this.checkPassiveWaste(event);
    this.checkActiveWaste(event);
  }

  checkForMaxFocus(event) {
    if (event.sourceID === this.owner.player.id) {
      event.classResources.forEach(classResource => {
        if (classResource.type === RESOURCE_TYPES.FOCUS && classResource['max'] > this._maxFocus) {
          //note: this works for now, but may not work if max focus becomes changable mid-fight, then max would have to be calculated on an event-by-event basis
          this._maxFocus = classResource['max'];
        }
      });
    }
  }

  checkPassiveWaste(event) {
    if ((event.sourceID === this.owner.player.id || event.targetID === this.owner.player.id) && event.classResources && event.classResources[0].type === RESOURCE_TYPES.FOCUS) {
      this.checkForMaxFocus(event);
      this.tracker++;
      const secIntoFight = (event.timestamp - this.owner.fight.start_time);
      if (event.classResources[0]['cost']) {
        this.focusBySecond[secIntoFight] = (event.classResources[0]['amount'] - event.classResources[0]['cost']);
      }
      else {
        this.focusBySecond[secIntoFight] = (event.classResources[0]['amount']);
      }
      this.checkForError(secIntoFight);
      this.extrapolateFocus(event.timestamp);
    }
  }

  checkForError(secIntoFight) {
    if (this.focusBySecond[secIntoFight] - this._maxFocus > 0) {
      this.focusBySecond[secIntoFight] = Math.floor(this.focusBySecond[secIntoFight]);
    }
  }

  checkActiveWaste(event) {
    if (event.sourceID === this.owner.player.id) {
      this.tracker++;
      if (this.generatorCasts[event.ability.guid]) {
        this.generatorCasts[event.ability.guid]++;
      }
      else {
        this.generatorCasts[event.ability.guid] = 1;
      }
      if (this.activeFocusGenerated[event.ability.guid]) {
        this.activeFocusGenerated[event.ability.guid] += event.resourceChange;
      }
      else {
        this.activeFocusGenerated[event.ability.guid] = event.resourceChange;
      }
      if (event.waste > 0) {
        if (this.activeFocusWasted[event.ability.guid]) {
          this.activeFocusWasted[event.ability.guid] += event.waste;
        }
        else {
          this.activeFocusWasted[event.ability.guid] = event.waste;
        }

        if (this.activeFocusWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)]) {
          this.activeFocusWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)] += event.waste;
        }
        else {
          this.activeFocusWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)] = event.waste;
        }
      }
    }
  }

  extrapolateFocus(event) {
    this.focusGen = Math.round((10 + .1 * this.combatants.selected.hasteRating / 375) * 100) / 100;
    this.secondsCapped = 0;
    const maxFocus = this._maxFocus;
    this.focusBySecond[0] = maxFocus;
    for (let i = 0; i < (event - this.owner.fight.start_time); i++) {  //extrapolates focus given passive focus gain (TODO: Update for pulls with Volley)
      if (!this.focusBySecond[i]) {
        if (this.focusBySecond[i - 1] >= maxFocus) {
          this.focusBySecond[i] = maxFocus;
        }
        else {
          this.focusBySecond[i] = this.focusBySecond[i - 1] + this.focusGen / 1000;
        }
      }
      if (this.focusBySecond[i] - maxFocus > 0) {
        this.focusBySecond[i] = maxFocus;
      }
      if (maxFocus === this.focusBySecond[i]) {
        this.secondsCapped += 1 / 1000;
      }

    }
  }

}

export default FocusTracker;

