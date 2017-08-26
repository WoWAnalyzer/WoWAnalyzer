import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = false;

class MistsOfSheilun extends Module {
  // Implement Mists of Sheilun, Celestial Breath, and Refreshing Jade Wind
  procsMistsOfSheilun = 0;
  healsMistsOfSheilun = 0;
  healingMistsOfSheilun = 0;
  overhealingMistsOfSheilun = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.traitsBySpellId[SPELLS.MISTS_OF_SHEILUN_TRAIT.id] === 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.MISTS_OF_SHEILUN_BUFF.id) {
      this.procsMistsOfSheilun++;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.MISTS_OF_SHEILUN.id) {
      this.healsMistsOfSheilun++;
      this.healingMistsOfSheilun += event.amount;
      if(event.overheal) {
        this.overhealingMistsOfSheilun += event.overheal;
      }
    }
  }

  /* Commenting out for now - Removing because of bloat.
  statistic() {
    const avgMistsOfSheilunHealing = this.healingMistsOfSheilun / this.healsMistsOfSheilun || 0;
    const avgMistsOfSheilunTargets = this.healsMistsOfSheilun / this.procsMistsOfSheilun || 0;

    return (
          <StatisticBox
          icon={<SpellIcon id={SPELLS.MISTS_OF_SHEILUN_TRAIT.id} />}
          value={`${formatNumber(avgMistsOfSheilunHealing)}`}
          label={(
            <dfn data-tip={`You healed an average of ${(avgMistsOfSheilunTargets).toFixed(2)} targets per Mists of Sheilun proc over your ${this.procsMistsOfSheilun} procs.`}>
              Average Healing
            </dfn>
          )}
        />
      );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
  */

  on_finished() {
    if(debug) {
      console.log('Mists of Sheilun Procs: ' + this.procsMistsOfSheilun);
      console.log('Avg Heals per Procs: ' + (this.healsMistsOfSheilun / this.procsMistsOfSheilun));
      console.log('Avg Heals Amount: ' + (this.healingMistsOfSheilun / this.healsMistsOfSheilun));
    }
  }
}

export default MistsOfSheilun;
