import React from 'react';

import {formatNumber} from 'common/format';
import SPELLS from 'common/SPELLS';
import {calculateAzeriteEffects} from 'common/stats';

import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import Analyzer from 'parser/core/Analyzer';
import HIT_TYPES from 'game/HIT_TYPES';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';
import { SHATTER_DEBUFFS } from '../../constants';

// The number of seconds of cooldown reduction given to Frozen Orb per Ice Lance
const FO_REDUCTION_SEC = 0.5;

/**
 * See known issue below, this is a temporary fix
 * To update, see https://www.wowhead.com/spell=137020/frost-mage
 * AURA = 1 + (Damage modifier)
 */
const FROST_MAGE_AURA = 1 + (-0.24);

/**
 * Ice Lance deals an additional X1 (stacks and scales) damage and reduces the cooldown of Frozen Orb by 0.5 (does not stack or scale) sec.
 *
 * Known issue: X1 value in trait data is a flat value and does not apply class % aura, damage buffs, etc, and is not a separate damage event from Ice Lance.
 * This makes it very difficult to determine what the actual damage gained from the trait is; see: https://github.com/WoWAnalyzer/WoWAnalyzer/issues/2088
 */
class Whiteout extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
    spellUsable: SpellUsable,
    statTracker: StatTracker,
  };

  hadFingersProc = false;
  bonusDamagePerIceLance = 0;
  frozenOrbReductions = 0;
  totalWhiteoutDamage = 0;

  constructor(...args) {
    super(...args);
    if (!this.selectedCombatant.hasTrait(SPELLS.WHITEOUT.id)) {
      this.active = false;
      return;
    }

    const ranks = this.selectedCombatant.traitsBySpellId[SPELLS.WHITEOUT.id];
    for (const rank of ranks) {
      const [damage] = calculateAzeriteEffects(SPELLS.WHITEOUT.id, rank);
      this.bonusDamagePerIceLance += damage;
    }

    this.bonusDamagePerIceLance *= FROST_MAGE_AURA;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.ICE_LANCE.id) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, FO_REDUCTION_SEC * 1000);
      this.frozenOrbReductions += 1;
    }

    this.hadFingersProc = this.selectedCombatant.hasBuff(SPELLS.FINGERS_OF_FROST.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ICE_LANCE_DAMAGE.id) {
      return;
    }

    // The Whiteout damage is affected by versatility no other stats
    let estimatedBonusDamage = this.bonusDamagePerIceLance * (1 + this.statTracker.currentVersatilityPercentage);

    // This is the damage modifier after personal player buffs (i.e. only external increases or reductions like chaos brand and boss phases)
    const damageModifier = (event.amount / event.unmitigatedAmount) / (event.hitType === HIT_TYPES.CRIT ? 2 : 1);

    // Apply the damage modifier to the estimated Whiteout damage
    estimatedBonusDamage *= damageModifier;

    if (event.hitType === HIT_TYPES.CRIT) {
      estimatedBonusDamage *= 2;
    }

    // Check for shatter effects, these multiply the damage of Ice Lance by 3
    const enemy = this.enemies.getEntity(event);
    if ((enemy && SHATTER_DEBUFFS.some(effect => enemy.hasBuff(effect, event.timestamp))) || this.hadFingersProc) {
      estimatedBonusDamage *= 3;
    }

    this.totalWhiteoutDamage += estimatedBonusDamage;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.WHITEOUT.id}
        value={(
          <>
            {formatNumber(this.totalWhiteoutDamage / this.owner.fightDuration * 1000)} DPS<br />
            {(FO_REDUCTION_SEC * this.frozenOrbReductions).toFixed(1)} sec. CD reduction<br />
          </>
        )}
        tooltip={
          `DPS value does not take into account any extra Frozen Orb casts from the lowered cooldown. Whiteout may have provided more DPS than totalled here if extra Frozen Orbs were cast effectively.</i><br />
          Bonus Ice Lance damage: <b>${formatNumber(this.totalWhiteoutDamage)}</b>`
        }
      />
    );
  }

}

export default Whiteout;
