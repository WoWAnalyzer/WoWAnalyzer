import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

class ComboPointTracker extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  pointsGained = 0;
  pointsWasted = 0;
  pointsSpent = 0;
  currentPoints = 0;
  maxPoints = 5;

  //stores number of points gained/spent/wasted per ability ID
  gained = {};
  spent = {};
  wasted = {};

  on_initialized() {
    const player = this.combatants.selected;

    this.pointGeneratingAbilities = [
      SPELLS.SHRED.id,
      SPELLS.RAKE.id,
      SPELLS.THRASH_FERAL.id,
      SPELLS.PRIMAL_FURY.id,
      SPELLS.ASHAMANES_FRENZY.id,
      ...(player.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id) ? [SPELLS.BRUTAL_SLASH_TALENT.id] : [SPELLS.CAT_SWIPE.id]),
      ...(player.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id) ? [SPELLS.LUNAR_INSPIRATION_TALENT.id] : []),
    ];

    this.pointSpendingAbilities = [
      SPELLS.RIP.id,
      SPELLS.MAIM.id,
      SPELLS.FEROCIOUS_BITE.id,
      ...(player.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id) ? [SPELLS.SAVAGE_ROAR_TALENT.id] : []),
    ];

    //initialize abilties
    this.pointGeneratingAbilities.forEach(x => {
      this.gained[x] = { points: 0 };
      this.wasted[x] = { points: 0 };
    });
    this.pointSpendingAbilities.forEach(x => this.spent[x] = { points: 0 });
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    const waste = event.waste;
    const gain = event.resourceChange - waste;

    if (this.pointGeneratingAbilities.indexOf(spellId) === -1) {
      return;
    }

    if (waste !== 0) {
      this.wasted[spellId].points += waste;
      this.pointsWasted += waste;
    }
    if (gain !== 0) {
      this.gained[spellId].points += gain;
      this.pointsGained  += gain;
      this.currentPoints += gain;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // some point generating spells do not have energize events so they are handled here
    if (spellId === SPELLS.THRASH_FERAL.id || spellId === SPELLS.BRUTAL_SLASH_TALENT.id) {
      this.processNonEnergizeCast(spellId);
    }
    if (this.pointSpendingAbilities.indexOf(spellId) === -1) {
      return;
    }
    // checking for free no CP procs, classResources seems to be the only difference
    if (!event.classResources[1]) {
      return;
    } else if (event.classResources[1].amount) {
      this.processPointSpenders(event, spellId);
    }
  }

  processNonEnergizeCast(spellId) {
    if (this.currentPoints === this.maxPoints) {
      this.wasted[spellId].points += 1;
      this.pointsWasted += 1;
    }    else {
      this.gained[spellId].points += 1;
      this.pointsGained += 1;
    }
  }

  processPointSpenders(event, spellId) {
    // each finisher uses all available points, varying from 1 to 5
    const pointsInCast = event.classResources[1].amount;

    this.spent[spellId].points += pointsInCast;
    this.pointsSpent += pointsInCast;
    this.currentPoints = 0;
  }
}

export default ComboPointTracker;
