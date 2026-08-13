import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { ReactNode } from 'react';

import { isDivineResonanceShield } from '../CastLinkNormalizer';

/**
 * Divine Resonance repeats Avenger's Shield every 5s for 15s after Divine Toll.
 *
 * Those repeats emit damage but no cast event, so without attribution they are invisible
 * - they show up neither in cast counts nor against any ability. On a 12.0.7 log they
 * accounted for a third of all Avenger's Shield firings.
 */
export default class DivineResonance extends Analyzer {
  /** Distinct Avenger's Shield firings produced by Divine Resonance. */
  repeats = 0;
  damage = 0;

  private lastRepeatTimestamp = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVINE_RESONANCE_SHARED_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.AVENGERS_SHIELD_TALENT),
      this.onShieldDamage,
    );
  }

  private onShieldDamage(event: DamageEvent) {
    if (!isDivineResonanceShield(event)) {
      return;
    }
    this.damage += event.amount + (event.absorbed ?? 0);
    // One firing bounces to several targets, so only count a new firing when the damage
    // is separated from the previous hit by more than a bounce could account for.
    if (event.timestamp - this.lastRepeatTimestamp > 500) {
      this.repeats += 1;
    }
    this.lastRepeatTimestamp = event.timestamp;
  }

  statistic(): ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <SpellLink spell={TALENTS.DIVINE_RESONANCE_SHARED_TALENT} /> repeated{' '}
            <SpellLink spell={TALENTS.AVENGERS_SHIELD_TALENT} /> <strong>{this.repeats}</strong>{' '}
            times for <strong>{formatNumber(this.damage)}</strong> damage. These repeats have no
            cast of their own, so they are not counted in your Avenger's Shield cast total.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.DIVINE_RESONANCE_TALENT_HOLY}>
          {this.repeats} <small>free Avenger's Shields</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
