import React from 'react';

import {formatNumber} from 'common/format';
import SPELLS from 'common/SPELLS';
import {calculateAzeriteEffects} from 'common/stats';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import HIT_TYPES from 'game/HIT_TYPES';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';
import { SHATTER_DEBUFFS, FROST_MAGE_AURA, FROZEN_ORB_REDUCTION } from '../../constants';

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
  protected enemies!: EnemyInstances;
  protected spellUsable!: SpellUsable;
  protected statTracker!: StatTracker;

  hadFingersProc = false;
  bonusDamagePerIceLance = 0;
  frozenOrbReductions = 0;
  totalWhiteoutDamage = 0;

  constructor(options: any) {
    super(options);
    if (!this.selectedCombatant.hasTrait(SPELLS.WHITEOUT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE_DAMAGE), this.onDamage);

    const ranks = this.selectedCombatant.traitsBySpellId[SPELLS.WHITEOUT.id];
    for (const rank of ranks) {
      const [damage] = calculateAzeriteEffects(SPELLS.WHITEOUT.id, rank);
      this.bonusDamagePerIceLance += damage;
    }

    this.bonusDamagePerIceLance *= FROST_MAGE_AURA;
  }

  onCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, FROZEN_ORB_REDUCTION);
      this.frozenOrbReductions += 1;
    }

    this.hadFingersProc = this.selectedCombatant.hasBuff(SPELLS.FINGERS_OF_FROST.id);
  }

  onDamage(event: DamageEvent) {
    // The Whiteout damage is affected by versatility no other stats
    let estimatedBonusDamage = this.bonusDamagePerIceLance * (1 + this.statTracker.currentVersatilityPercentage);

    // This is the damage modifier after personal player buffs (i.e. only external increases or reductions like chaos brand and boss phases)
    const damageModifier = event.amount && event.unmitigatedAmount ? (event.amount / event.unmitigatedAmount) / (event.hitType === HIT_TYPES.CRIT ? 2 : 1) : 1;

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
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={(
          <>
            DPS value does not take into account any extra Frozen Orb casts from the lowered cooldown. Whiteout may have provided more DPS than totalled here if extra Frozen Orbs were cast effectively.<br />
            Bonus Ice Lance damage: <strong>{formatNumber(this.totalWhiteoutDamage)}</strong>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.WHITEOUT}>
          <>
            {formatNumber(this.totalWhiteoutDamage / this.owner.fightDuration * 1000)} <small>DPS</small><br />
            {((FROZEN_ORB_REDUCTION / 1000) * this.frozenOrbReductions).toFixed(1)} <small>sec. CD reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Whiteout;
