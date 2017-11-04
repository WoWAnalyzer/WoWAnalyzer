import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';


class RunicPowerTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rpWasted = 0;
  rpSpent = 0;
  totalRPGained = 0;

  // stores amount of rp generated/spent/wasted per ability ID
  generatedAndWasted = {
    [SPELLS.FESTERING_STRIKE.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SCOURGE_STRIKE.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.DEATH_AND_DECAY.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.OUTBREAK.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.FESTERING_WOUND_BURST.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.ARMY_OF_THE_DEAD.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.ANTI_MAGIC_SHELL_RP_GAINED.id]: {
      generated: 0,
      wasted: 0,
      alternateId: SPELLS.ANTI_MAGIC_SHELL.id,
    },
    [SPELLS.CHAINS_OF_ICE.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.DEFILE_TALENT.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.CLAWING_SHADOWS_TALENT.id]: {
      generated: 0,
      wasted: 0,
    },
  };

  spent = {
    [SPELLS.DEATH_COIL.id]: 0,
    [SPELLS.DEATH_STRIKE.id]: 0,
  };

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (!this.generatedAndWasted[spellId]) {
      return;
    }

    this.generatedAndWasted[spellId].generated += (event.resourceChange || 0);
    this.generatedAndWasted[spellId].wasted += (event.waste || 0);
    this.rpWasted += (event.waste || 0);
    this.totalRPGained += (event.resourceChange || 0) + (event.waste || 0);
  }


  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.spent[spellId] === undefined) {
      return;
    }

    const rpCost = event.classResources[0].cost / 10;
    this.spent[spellId] += rpCost;
    this.rpSpent += rpCost;
    this.currentRP -= rpCost;
  }
}

export default RunicPowerTracker;
