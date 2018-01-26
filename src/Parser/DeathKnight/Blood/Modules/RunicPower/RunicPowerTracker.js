import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

const DEATH_STRIKE_BASE_COST = 45;

class RunicPowerTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rpWasted = 0;
  rpSpent = 0;
  totalRPGained = 0;

  // stores amount of rp generated/spent/wasted per ability ID
  generatedAndWasted = {
    [SPELLS.MARROWREND.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.HEART_STRIKE.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.DEATH_AND_DECAY.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.RAPID_DECOMPOSITION_RP_TICK.id]: {
      generated: 0,
      wasted: 0,
      alternateId: SPELLS.RAPID_DECOMPOSITION_TALENT.id,
    },
    [SPELLS.BLOODDRINKER_TALENT.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.BLOOD_STRIKE.id]: {
      generated: 0,
      wasted: 0,
      alternateId: SPELLS.DANCING_RUNE_WEAPON.id,
    },
    [SPELLS.ANTI_MAGIC_SHELL_RP_GAINED.id]: {
      generated: 0,
      wasted: 0,
      alternateId: SPELLS.ANTI_MAGIC_SHELL.id,
    },
    [SPELLS.DEATHS_CARESS.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.ARCANE_TORRENT_RUNIC_POWER.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SHACKLES_OF_BRYNDAOR_BUFF.id]: {
      generated: 0,
      wasted: 0,
    },
  };

  spent = {
    [SPELLS.DEATH_STRIKE.id]: 0,
    [SPELLS.MARK_OF_BLOOD.id]: 0,
    [SPELLS.BONESTORM_TALENT.id]: 0,
  };

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (!this.generatedAndWasted[spellId]) {
      return;
    }

    this.generatedAndWasted[spellId].generated += (event.resourceChange || 0);
    this.generatedAndWasted[spellId].wasted += (event.waste || 0);
    this.rpWasted += (event.waste || 0);
    this.totalRPGained += (event.resourceChange || 0);
  }


  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.spent[spellId] === undefined) {
      return;
    }

    let rpCost;
    if (spellId === SPELLS.DEATH_STRIKE.id) {
      rpCost = DEATH_STRIKE_BASE_COST;
      if (this.combatants.selected.hasBuff(SPELLS.OSSUARY.id, event.timestamp)) {
        rpCost -= 5;
      }
      if (this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id) &&
        this.combatants.selected.hasBuff(SPELLS.GRAVEWARDEN.id, event.timestamp)) {
        rpCost -= 5;
      }
    } else {
      rpCost = event.classResources[0].cost / 10;
    }
    this.spent[spellId] += rpCost;
    this.rpSpent += rpCost;
    this.currentRP -= rpCost;
  }
}

export default RunicPowerTracker;
