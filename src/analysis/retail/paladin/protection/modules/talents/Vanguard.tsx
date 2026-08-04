import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';

import { consumedVanguard } from '../CastLinkNormalizer';

/**
 * Glory of the Vanguard gives Judgment a chance to grant Vanguard, which empowers the
 * next Avenger's Shield.
 *
 * Vanguard stacks up to 2. Spending a stack emits a removebuffstack immediately followed
 * by a refreshbuff (the remaining stack's duration is reset), so a refresh is *not*
 * evidence of a wasted proc — by the time it fires the stack count has already dropped.
 * A proc arriving while already at max stacks has nowhere to go, and that is the only
 * case where a refresh represents waste.
 */
export const MAX_VANGUARD_STACKS = 2;

export default class Vanguard extends Analyzer {
  /** Every proc gained, including ones that were wasted by arriving at max stacks. */
  generated = 0;
  /** Procs spent on an Avenger's Shield. */
  consumed = 0;
  /** Procs lost because they landed while already at max stacks. */
  overcapped = 0;
  /** Procs that fell off without being spent. */
  expired = 0;

  private stacks = 0;

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
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onRemoveBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff() {
    this.generated += 1;
    this.stacks = 1;
  }

  private onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.generated += Math.max(1, event.stack - this.stacks);
    this.stacks = event.stack;
  }

  private onRefreshBuff() {
    // Only a refresh that arrives while we are still capped represents a proc with
    // nowhere to go. Spending a stack also emits a refresh, but the stack count has
    // already been decremented by then.
    if (this.stacks >= MAX_VANGUARD_STACKS) {
      this.generated += 1;
      this.overcapped += 1;
    }
  }

  private onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.resolve(event, Math.max(0, this.stacks - event.stack));
    this.stacks = event.stack;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    this.resolve(event, this.stacks);
    this.stacks = 0;
  }

  private resolve(event: RemoveBuffEvent | RemoveBuffStackEvent, spent: number) {
    if (spent <= 0) {
      return;
    }
    if (consumedVanguard(event)) {
      this.consumed += spent;
    } else {
      this.expired += spent;
    }
  }

  /** Procs still held when the fight ended. Neither used nor definitively wasted. */
  get unresolved() {
    return Math.max(0, this.generated - this.consumed - this.overcapped - this.expired);
  }

  get wasted() {
    return this.overcapped + this.expired;
  }

  get percentWasted() {
    return this.generated === 0 ? 0 : this.wasted / this.generated;
  }
}
