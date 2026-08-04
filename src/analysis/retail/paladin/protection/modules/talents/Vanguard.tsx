import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RemoveBuffEvent } from 'parser/core/Events';

import { consumedVanguard } from '../CastLinkNormalizer';

/**
 * Glory of the Vanguard gives Judgment a chance to grant Vanguard, which empowers the
 * next Avenger's Shield. The buff does not stack, so a proc landing while one is already
 * active overwrites — and wastes — the pending one.
 */
export default class Vanguard extends Analyzer {
  /** Every proc gained, including those that immediately overwrote a pending proc. */
  generated = 0;
  /** Procs spent on an Avenger's Shield. */
  consumed = 0;
  /** Procs replaced by a newer proc before they could be spent. */
  overwritten = 0;
  /** Procs that fell off without being spent. */
  expired = 0;

  private buffActive = false;

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.hasTalent(TALENTS.GLORY_OF_THE_VANGUARD_1_PROTECTION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.GLORY_OF_THE_VANGUARD_2_PROTECTION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.GLORY_OF_THE_VANGUARD_3_PROTECTION_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff() {
    this.generated += 1;
    this.buffActive = true;
  }

  private onRefreshBuff() {
    // A refresh means a new proc landed while one was still pending, so the previous
    // proc is lost.
    this.generated += 1;
    this.overwritten += 1;
    this.buffActive = true;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    if (!this.buffActive) {
      return;
    }
    if (consumedVanguard(event)) {
      this.consumed += 1;
    } else {
      this.expired += 1;
    }
    this.buffActive = false;
  }

  /** Procs that were still pending when the fight ended. Neither used nor definitively wasted. */
  get unresolved() {
    return Math.max(0, this.generated - this.consumed - this.overwritten - this.expired);
  }

  get wasted() {
    return this.overwritten + this.expired;
  }

  get percentWasted() {
    return this.generated === 0 ? 0 : this.wasted / this.generated;
  }
}
