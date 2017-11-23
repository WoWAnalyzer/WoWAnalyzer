import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ResourceTypes from 'common/RESOURCE_TYPES';

import SPELLS from 'common/SPELLS';

class ChiTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  chiGained = 0;
  chiWasted = 0;
  totalChiSpent = 0;
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
    if (combatant.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT.id)) {
      this.constructor.POINT_SPENDING_ABILITIES.push(SPELLS.RUSHING_JADE_WIND_TALENT.id);
    }
    if (combatant.hasTalent(SPELLS.ASCENSION_TALENT.id)) {
      this.maxPoints = 6;
    }
    if (combatant.hasBuff(SPELLS.WW_TIER21_2PC.id)) {
      this.constructor.POINT_GENERATING_ABILITIES.push(SPELLS.FOCUS_OF_XUEN.id);
    }

    // initialize abilties
    this.constructor.POINT_GENERATING_ABILITIES.forEach((x) => {
      this.gained[x] = { points: 0 };
      this.wasted[x] = { points: 0 };
    });
    this.constructor.POINT_SPENDING_ABILITIES.forEach(x => {
      this.spent[x] = { points: 0 };
      this.casts[x] = { total: 0  };
    });
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    let waste = event.waste;
    const gain = event.resourceChange - waste;

    if (this.constructor.POINT_GENERATING_ABILITIES.indexOf(spellId) === -1) {
      return;
    }
    if (event.resourceChangeType !== ResourceTypes.CHI) {
      return;
    }
    if (waste !== 0) {
      // Energizing Elixir actually gives 10 chi rather than filling it up as the tooltip reads
      if (spellId === SPELLS.ENERGIZING_ELIXIR_TALENT.id) {
          waste = waste - (10 - this.maxPoints);
      }
      this.wasted[spellId].points += waste;
      this.chiWasted += waste;
    }
    if (gain !== 0) {
      this.gained[spellId].points += gain;
      this.chiGained += gain;
      this.currentPoints += gain;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (this.constructor.POINT_SPENDING_ABILITIES.indexOf(spellId) === -1) {
      return;
    }
    const chiSpent = event.resourceChange;
    this.spent[spellId].points += chiSpent;
    this.totalChiSpent += chiSpent;
    this.casts[spellId].total += 1;
    this.totalCasts += 1;
  }

  processPointSpenders(event, spellId) {
    


  }
}

export default ChiTracker;
