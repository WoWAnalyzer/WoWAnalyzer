import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

/**
 * The Tactician effect improves your next Overpower, causing it to deal 902 additional damage
 * and reduce the remaining cooldown of Mortal Strike by 1.5 sec.
 *
 * Example report: /report/4zwyMv92mqP7kfQF/5-Mythic+Taloc+-+Kill+(5:36)/5-Azzinöth
 */

const CDR_PER_PROC = 1500; // ms

/**
 * Ok so this trait replaced Executioner's Precision since 8.1
 * BUT the id from the equipped azerite powers is still the one from EP
 * that's why the module is active if player hasTrait -> EP ¯\_(ツ)_/¯
 *
 * I checked it also for the real ID in case it changed soon
 */

// TODO: Keep an eye on ID change to clean that mess
// TODO: Check and add suggestion if it's the case : Worth avoiding wasting cdr ?

class StrikingTheAnvil extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  wastedReduction = 0;
  effectiveReduction = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EXECUTIONERS_PRECISION_TRAIT.id) || this.selectedCombatant.hasTrait(SPELLS.STRIKING_THE_ANVIL.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.OVERPOWER), this._onOverpowerCast);
  }

  _onOverpowerCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.STRIKING_THE_ANVIL_BUFF.id)) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.MORTAL_STRIKE.id)) {
      this.wastedReduction += CDR_PER_PROC;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.MORTAL_STRIKE.id, CDR_PER_PROC);
      this.effectiveReduction += effectiveReduction;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.STRIKING_THE_ANVIL.id}
        value={`${formatNumber(this.effectiveReduction / 1000)}s Mortal Strike CDR`}
        tooltip={`${formatNumber(this.wastedReduction / 1000)}s missed CDR`}
      />
    );
  }
}

export default StrikingTheAnvil;
