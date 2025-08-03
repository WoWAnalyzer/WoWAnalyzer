import { AnyEvent, CastEvent, EventType, SummonEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import InsertableEventsWrapper from 'parser/core/InsertableEventsWrapper';
import { Options } from 'parser/core/Module';
import spells from '../../spell-list_Monk_Brewmaster.classic';

const XUEN_SUMMON_ID = 132578;

/**
 * In MoP, the cast for Brewmaster's Xuen doesn't log. This normalizes that based on the summon.
 */
export default class XuenNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasClassicTalent(
      spells.INVOKE_XUEN_THE_WHITE_TIGER_TALENT,
    );
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const insertable = new InsertableEventsWrapper(events);

    for (const event of events) {
      if (event.type === EventType.Summon && event.ability.guid === XUEN_SUMMON_ID) {
        // fabricate a xuen cast
        const fabCast = this.fabricateCast(event);
        insertable.addBeforeEvent(fabCast, event);
      }
    }

    return insertable.build();
  }

  private fabricateCast(sourceEvent: SummonEvent) {
    const newEvent = {
      timestamp: sourceEvent.timestamp,
      sourceID: sourceEvent.sourceID,
      sourceIsFriendly: sourceEvent.sourceIsFriendly,
      ability: { ...sourceEvent.ability, guid: spells.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id },
      __fabricated: true,
      type: EventType.Cast,
      targetIsFriendly: false,
    } satisfies CastEvent;

    return newEvent;
  }
}
