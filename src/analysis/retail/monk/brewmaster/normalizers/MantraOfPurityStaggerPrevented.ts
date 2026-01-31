import { AnyEvent, EventType, StaggerPreventedEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Module';
import SPELLS from '../spell-list_Monk_Brewmaster.retail';
import SPELLS_COMMON from 'common/SPELLS';

/**
 * Mantra of Purity only logs a `staggerprevented` event if the buff is consumed.
 *
 * This normalizer adds an event if the player has the MoP buff, absorbs stagger, and the stagger
 * does not have a linked staggerprevented event.
 *
 * TODO: this may be a generic issue with `staggerprevented` effects, but there are only two available
 * right now and the 2nd is virtually unplayed
 */
export default class MantraOfPurityStaggerPrevented extends EventsNormalizer {
  priority = -1000; // force running before EventLinkNormalizers
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.MANTRA_OF_PURITY_TALENT);
    console.log(this.active, 'mop');
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    let lastStaggerPreventedEvent: StaggerPreventedEvent | undefined;
    let hasMoP = false;

    const output: AnyEvent[] = [];
    for (const event of events) {
      if (
        event.type === EventType.StaggerPrevented &&
        event.sourceID === this.selectedCombatant.id
      ) {
        lastStaggerPreventedEvent = event;
      } else if (
        event.type === EventType.ApplyBuff &&
        event.ability.guid === SPELLS_COMMON.MANTRA_OF_PURITY_STAGGER_ABSORB.id &&
        event.sourceID === this.selectedCombatant.id
      ) {
        hasMoP = true;
      } else if (
        event.type === EventType.RemoveBuff &&
        event.ability.guid === SPELLS_COMMON.MANTRA_OF_PURITY_STAGGER_ABSORB.id &&
        event.sourceID === this.selectedCombatant.id
      ) {
        hasMoP = false;
      } else if (
        hasMoP &&
        event.type === EventType.Absorbed &&
        event.ability.guid === SPELLS.STAGGER_TALENT.id &&
        event.sourceID === this.selectedCombatant.id
      ) {
        const timeDelta = event.timestamp - (lastStaggerPreventedEvent?.timestamp ?? 0);
        if (timeDelta > 100) {
          output.push({
            timestamp: event.timestamp,
            type: EventType.StaggerPrevented,
            sourceID: event.sourceID,
            amount: event.amount,
            abilityID: SPELLS_COMMON.MANTRA_OF_PURITY_STAGGER_ABSORB.id,
            __fabricated: true,
          } satisfies StaggerPreventedEvent);
        }
      }

      output.push(event);
    }

    return output;
  }
}
