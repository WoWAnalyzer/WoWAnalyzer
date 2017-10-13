import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

class ChiTracker extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  pointsGained = 0;
  pointsWasted = 0;
  pointsSpent = 0;
  currentPoints = 0;
  maxCPCasts = 0;
  totalCasts = 0;
  maxPoints = 5;

  // stores number of points gained/spent/wasted per ability ID
  gained = {};
  spent = {};
  wasted = {};
  casts = {};

  static POINT_GENERATING_ABILITIES = [
    SPELLS.TIGER_PALM.id,
  ];

  static POINT_SPENDING_ABILITIES = [
    SPELLS.BLACKOUT_KICK.id,
    SPELLS.RISING_SUN_KICK.id,
    SPELLS.FISTS_OF_FURY_CAST.id,
    SPELLS.SPINNING_CRANE_KICK.id,
    SPELLS.STRIKE_OF_THE_WINDLORD.id,
  ];

  on_initialized() {
    const combatant = this.combatants.selected;

    if (combatant.hasTalent(SPELLS.ENERGIZING_ELIXIR_TALENT.id)) {
      this.constructor.POINT_GENERATING_ABILITIES.push(SPELLS.ENERGIZING_ELIXIR_TALENT.id);
    }
    if (combatant.hasTalent(SPELLS.POWER_STRIKES_TALENT.id)) {
        this.constructor.POINT_GENERATING_ABILITIES.push(SPELLS.POWER_STRIKES.id);
    }
    if (combatant.hasTalent(SPELLS.RUSHING_JADE_WIND.id)) {
      this.constructor.POINT_SPENDING_ABILITIES.push(SPELLS.RUSHING_JADE_WIND_TALENT.id);
    }

    // initialize abilties
    this.constructor.POINT_GENERATING_ABILITIES.forEach((x) => {
      this.gained[x] = { points: 0 };
      this.wasted[x] = { points: 0 };
    });
    this.constructor.POINT_SPENDING_ABILITIES.forEach(x => {
      this.spent[x] = { points: 0 };
      this.casts[x] = { total: 0, maxCP: 0 };
    });
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    const waste = event.waste;
    const gain = event.resourceChange - waste;

    if (this.constructor.POINT_GENERATING_ABILITIES.indexOf(spellId) === -1) {
      return;
    }

    if (waste !== 0) {
      this.wasted[spellId].points += waste;
      this.pointsWasted += waste;
    }
    if (gain !== 0) {
      this.gained[spellId].points += gain;
      this.pointsGained += gain;
      this.currentPoints += gain;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // some point generating spells do not have energize events so they are handled here
    if (spellId === SPELLS.THRASH_FERAL.id || spellId === SPELLS.BRUTAL_SLASH_TALENT.id) {
      this.processNonEnergizeCast(spellId);
    }
    if (this.constructor.POINT_SPENDING_ABILITIES.indexOf(spellId) === -1) {
      return;
    }
    // checking for free no CP procs, classResources seems to be the only difference
    if (!event.classResources[1]) {

    } else if (event.classResources[1].amount) {
      this.processPointSpenders(event, spellId);
    }
  }

  processNonEnergizeCast(spellId) {
    if (this.currentPoints === this.maxPoints) {
      this.wasted[spellId].points += 1;
      this.pointsWasted += 1;
    } else {
      this.gained[spellId].points += 1;
      this.pointsGained += 1;
    }
  }

  processPointSpenders(event, spellId) {
    // each finisher uses all available points, varying from 1 to 5
    const pointsInCast = event.classResources[1].amount;

    this.spent[spellId].points += pointsInCast;
    this.pointsSpent += pointsInCast;
    if (pointsInCast === 5){
      this.casts[spellId].maxCP += 1;
      this.maxCPCasts += 1;
    }
    this.casts[spellId].total += 1;
    this.totalCasts += 1;
    this.currentPoints = 0;
  }
}

export default ChiTracker;
