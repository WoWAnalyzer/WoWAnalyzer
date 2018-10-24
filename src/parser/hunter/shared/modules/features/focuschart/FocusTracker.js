import Analyzer from 'parser/core/Analyzer';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Haste from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';

class FocusTracker extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  lastEventTimestamp = 0;
  focusBySecond = [];
  activeFocusWasted = {};
  activeFocusWastedTimeline = {};
  generatorCasts = {};
  activeFocusGenerated = {};
  tracker = 0; //to tell if any prop has updated, since we can't compare arrays
  _maxFocus = 0;
  totalFocusGenModifier = 0;

  constructor(...args) {
    super(...args);
    this.lastEventTimestamp = this.owner.fight.start_time;
    this.secondsCapped = 0;
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

  on_toPlayer_energize(event) {
    this.checkPassiveWaste(event);
    this.checkActiveWaste(event);
  }

  checkForMaxFocus(event) {
    if (event.sourceID === this.owner.player.id) {
      event.classResources.forEach(classResource => {
        if (classResource.type === RESOURCE_TYPES.FOCUS.id && classResource.max > this._maxFocus) {
          //note: this works for now, but may not work if max focus becomes changable mid-fight, then max would have to be calculated on an event-by-event basis
          this._maxFocus = classResource.max;
        }
      });
    }
  }

  checkPassiveWaste(event) {
    if (event.classResources && event.classResources[0].type === RESOURCE_TYPES.FOCUS.id) {
      this.checkForMaxFocus(event);
      this.tracker++;
      const secIntoFight = (event.timestamp - this.owner.fight.start_time);
      if (event.classResources[0].cost) {
        this.focusBySecond[secIntoFight] = (event.classResources[0].amount - event.classResources[0].cost);
      }
      else {
        this.focusBySecond[secIntoFight] = (event.classResources[0].amount);
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
    if (!this.owner.byPlayer(event) && !this.owner.toPlayer(event)) {
      return;
    }
    if (!event.classResources || event.classResources[0].type !== RESOURCE_TYPES.FOCUS.id) {
      return;
    }

    if (!SPELLS[event.ability.guid]) {
      // The spells need to be defined so the view doesn't crash, this should be taken care off by the developer (you), but this at least prevents crashes.
      console.error('Focus generator missing in SPELLS!', event.ability);
      SPELLS[event.ability.guid] = {
        id: event.ability.guid,
        name: event.ability.name,
        icon: event.ability.abilityIcon.replace('.jpg', ''),
      };
    }

    this.tracker += 1;
    if (this.generatorCasts[event.ability.guid]) {
      this.generatorCasts[event.ability.guid] += 1;
    } else {
      this.generatorCasts[event.ability.guid] = 1;
    }
    if (this.activeFocusGenerated[event.ability.guid]) {
      this.activeFocusGenerated[event.ability.guid] += event.resourceChange;
    } else {
      this.activeFocusGenerated[event.ability.guid] = event.resourceChange;
    }
    if (event.waste > 0) {
      if (this.activeFocusWasted[event.ability.guid]) {
        this.activeFocusWasted[event.ability.guid] += event.waste;
      } else {
        this.activeFocusWasted[event.ability.guid] = event.waste;
      }

      if (this.activeFocusWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)]) {
        this.activeFocusWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)] += event.waste;
      } else {
        this.activeFocusWastedTimeline[Math.floor((event.timestamp - this.owner.fight.start_time) / 1000)] = event.waste;
      }
    }
  }

  extrapolateFocus(eventTimestamp) {
    if (this.selectedCombatant.spec === SPECS.BEAST_MASTERY_HUNTER) {
      this.focusGen = 10;
    } else if (this.selectedCombatant.spec === SPECS.MARKSMANSHIP_HUNTER) {
      this.focusGen = 3;
    } else {
      this.focusGen = 5;
    }
    this.focusGen += .1 * (this.haste.current * 100);
    this.totalFocusGenModifier += this.focusGen * (eventTimestamp - this.lastEventTimestamp);
    const maxFocus = this._maxFocus;
    this.focusBySecond[0] = maxFocus;
    for (let i = this.lastEventTimestamp - this.owner.fight.start_time; i < (eventTimestamp - this.owner.fight.start_time); i++) { //extrapolates focus given passive focus gain
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
    this.lastEventTimestamp = eventTimestamp;
  }

  get averageFocusGen() {
    return this.totalFocusGenModifier / this.owner.fightDuration;
  }

}

export default FocusTracker;

