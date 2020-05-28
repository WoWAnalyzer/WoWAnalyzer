import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import SpellUsable from '../features/SpellUsable';
import Seraphim from '../talents/Seraphim';

class LucidDreams extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
    sera: Seraphim,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;
  protected sera!: Seraphim;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasEssence(SPELLS.LUCID_DREAMS.traitId);

    if (!this.active) {
      return;
    }

    if (this.selectedCombatant.hasMajor(SPELLS.LUCID_DREAMS.traitId)) {
      options.abilities.add({
        spell: SPELLS.LUCID_DREAMS_MAJOR,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      });
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS), this.onCastSotR);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SERAPHIM_TALENT), this.onCastSotR);
    // the heal occurs when a refund happens
    this.addEventListener(Events.heal.to(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_HEAL), this.onRefund);
  }

  private lastCast?: CastEvent;
  private refundedCD = {
    [SPELLS.SERAPHIM_TALENT.id]: 0,
    [SPELLS.SHIELD_OF_THE_RIGHTEOUS.id]: 0,
  };

  private refundCounts = {
    [SPELLS.SERAPHIM_TALENT.id]: 0,
    [SPELLS.SHIELD_OF_THE_RIGHTEOUS.id]: 0,
  };

  onCastSotR(event: CastEvent) {
    this.lastCast = event;
  }

  onRefund(event: HealEvent) {
    let refund;
    if (this.lastCast!.ability.guid === SPELLS.SERAPHIM_TALENT.id) {
      refund = this.sera.lastCDConsumed / 2;
    } else {
      refund = this.abilities.getExpectedCooldownDuration(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, event)! / 2;
    }
    try {
      this.spellUsable.reduceCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, refund);
    } catch (e) {
      // i have found exactly 1 log where this throws an error because
      // SotR is not on CD, but I cannot figure out why. The refund
      // events are always after the cast events (and looking at
      // fabricated events in the event view confirms that).
      //
      // it only happens once in that one log, so I'm going to just move on
        console.error(`Error reducing the cooldown of SotR due to Memory of Lucid Dreams: ${e}. Last Cast: ${this.lastCast}`);
    }
    this.refundedCD[this.lastCast!.ability.guid] += refund;
    this.refundCounts[this.lastCast!.ability.guid] += 1;
  }

  get cdr() {
    return Object.values(this.refundedCD).reduce((a, b) => a + b);
  }

  get effectiveCDR() {
    return this.cdr / (this.owner.fightDuration + this.cdr);
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.LUCID_DREAMS.traitId);
    return (
      <ItemStatistic size="small"
        tooltip={(
          <>
            Your Shield of the Righteous Cooldown was reduced by: <ul>
              <li>Shield of the Righteous — <b>{(this.refundedCD[SPELLS.SHIELD_OF_THE_RIGHTEOUS.id] / 1000).toFixed(2)}s</b> (<b>{this.refundCounts[SPELLS.SHIELD_OF_THE_RIGHTEOUS.id]}</b> procs)</li>
              {this.sera.active ? <li>Seraphim — <b>{(this.refundedCD[SPELLS.SERAPHIM_TALENT.id] / 1000).toFixed(2)}s</b> (<b>{this.refundCounts[SPELLS.SERAPHIM_TALENT.id]}</b> procs)</li> : null}
            </ul>
            for a total of <b>{(this.cdr / 1000).toFixed(2)}s</b> of cooldown reduction.
                    </>)}>
        <div className="pad boring-text">
          <label><SpellLink id={SPELLS.LUCID_DREAMS_MINOR.id} /> - Minor Rank {rank}</label>
          <div className="value">
            {formatPercentage(this.effectiveCDR)}% CDR
                    </div>
        </div>
      </ItemStatistic>
    );
  }
}

export default LucidDreams;
