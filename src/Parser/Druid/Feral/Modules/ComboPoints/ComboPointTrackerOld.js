import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

class ComboPointTracker extends Analyzer {
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
    SPELLS.SHRED.id,
    SPELLS.RAKE.id,
    SPELLS.THRASH_FERAL.id,
    SPELLS.PRIMAL_FURY.id,
    SPELLS.ASHAMANES_FRENZY.id,
  ];

  static POINT_SPENDING_ABILITIES = [
    SPELLS.RIP.id,
    SPELLS.MAIM.id,
    SPELLS.FEROCIOUS_BITE.id,
  ];

  on_initialized() {
    const combatant = this.combatants.selected;

    if (combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id)) {
      this.constructor.POINT_GENERATING_ABILITIES.push(SPELLS.LUNAR_INSPIRATION_TALENT.id);
    }
    if (combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id)) {
      this.constructor.POINT_GENERATING_ABILITIES.push(SPELLS.BRUTAL_SLASH_TALENT.id);
    } else {
      this.constructor.POINT_GENERATING_ABILITIES.push(SPELLS.CAT_SWIPE.id);
    }
    if (combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id)) {
      this.constructor.POINT_SPENDING_ABILITIES.push(SPELLS.SAVAGE_ROAR_TALENT.id);
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

export default ComboPointTracker;
