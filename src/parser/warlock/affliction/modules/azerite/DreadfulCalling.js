import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import { UNSTABLE_AFFLICTION_DEBUFFS } from '../../constants';

const CDR_PER_CAST = 1000;
const UNSTABLE_AFFLICTION_SP_COEFFICIENT = 0.16;

/*
    Dreadful Calling
      Unstable Affliction deals X additional damage, and casting Unstable Affliction reduce the cooldown of Summon Darkglare by 1 sec.
 */
class DreadfulCalling extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    statTracker: StatTracker,
  };

  damageFromTraits = 0;
  effectiveReduction = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DREADFUL_CALLING.id);
    if (!this.active) {
      return;
    }
    // the tooltip here is misleading - in the tooltip it's 4 * bonus damage for all ticks combined, calculateAzeriteEffects() correctly returns bonus per tick
    this.damageFromTraits = this.selectedCombatant.traitsBySpellId[SPELLS.DREADFUL_CALLING.id].reduce((total, rank) => {
      const [ damage ] = calculateAzeriteEffects(SPELLS.DREADFUL_CALLING.id, rank);
      return total + damage;
    }, 0);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_AFFLICTION_CAST), this.onUAcast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(UNSTABLE_AFFLICTION_DEBUFFS), this.onUAdamage);
  }

  onUAdamage(event) {
    this.damage += calculateBonusAzeriteDamage(event, this.damageFromTraits, UNSTABLE_AFFLICTION_SP_COEFFICIENT, this.statTracker.currentIntellectRating);
  }

  onUAcast() {
    if (this.spellUsable.isOnCooldown(SPELLS.SUMMON_DARKGLARE.id)) {
      this.effectiveReduction += this.spellUsable.reduceCooldown(SPELLS.SUMMON_DARKGLARE.id, CDR_PER_CAST);
    }
  }

  get effectiveCDRseconds() {
    return (this.effectiveReduction / 1000).toFixed(1);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.DREADFUL_CALLING.id}
        value={<ItemDamageDone amount={this.damage} approximate />}
        tooltip={`Estimated bonus Unstable Affliction damage: ${formatThousands(this.damage)}<br />You also reduced your Summon Darkglare cooldown by ${this.effectiveCDRseconds} seconds<br /><br />
                The damage is an approximation using current Intellect values at given time. Note that this estimate does NOT take into account lowered cooldown of Darkglare.
                Also, because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be also little incorrect.`}
      />
    );
  }
}

export default DreadfulCalling;
