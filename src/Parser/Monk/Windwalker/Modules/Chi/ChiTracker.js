import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

class ChiTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  maxChi = 5;
  chiWasted = 0;

  on_initialized() {
    this.resource = RESOURCE_TYPES.CHI;

    if (this.combatants.selected.hasTalent(SPELLS.ASCENSION_TALENT.id)) {
      this.maxChi = 6;
    }
  }

  getReducedCost(event) {
    if (!this.getResource(event).cost) {
      return 0;
    }
    let cost = this.getResource(event).cost;
    const spellId = event.ability.guid;

    // Blackout Kick costs 3 chi when learned, but is reduced in cost during levelling
    if (spellId === SPELLS.BLACKOUT_KICK.id) {
        cost = 1;     
    }
    if (spellId === SPELLS.FISTS_OF_FURY_CAST.id && this.combatants.selected.hasFeet(ITEMS.KATSUOS_ECLIPSE.id)) {
      cost = cost - 1;
    }
    return cost;
  }

  // Energizing Elixir actually gives 10 chi rather than filling it up as the tooltip reads
  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;

    if (event.resourceChangeType !== RESOURCE_TYPES.CHI.id) {
      return;
    }
    let waste = event.waste;
    const gain = event.resourceChange - waste;
    if (spellId === SPELLS.ENERGIZING_ELIXIR_TALENT.id) {
      waste = waste - (10 - this.maxChi);
    }
    this._applyBuilder(spellId, this.getResource(event), gain, waste);
    this.chiWasted += waste;
  }
}

export default ChiTracker;
