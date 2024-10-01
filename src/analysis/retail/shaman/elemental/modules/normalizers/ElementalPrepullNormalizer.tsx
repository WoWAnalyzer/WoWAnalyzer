import SPELLS from 'common/SPELLS/shaman';
import {
  Event,
  AnyEvent,
  EventType,
  HasAbility,
  HasSource,
  SourcedEvent,
  TargettedEvent,
  HasTarget,
  SummonEvent,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Analyzer';
import { NORMALIZER_ORDER } from '../../constants';

/** Ancestors last 6 seconds */
const BASE_ANCESTOR_DURATION = 6000;
/** Heed My Call increases duration by 4 seconds */
const HEED_MY_CALL_DURATION = 4000;
/** Ancestors cast an elemental blast on expiring, which is the only guaranteed damage instance.
 * This buffer ensures that if no other damage spells were cast by the ancestor, it will still
 * be detected */
const BUFFER_MS = 2000;

class ElementalPrepullNormalizer extends EventsNormalizer {
  private ancestorSourceId: number | undefined;

  constructor(options: Options) {
    super(options);
    this.ancestorSourceId = this.owner.playerPets.find((pet) => pet.name === 'Ancestor')?.id;
    this.active = Boolean(this.ancestorSourceId);
    this.priority = NORMALIZER_ORDER.Prepull;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    // normalize ancestor summons
    const instances = new Set<number>();
    const ancestorDuration =
      BASE_ANCESTOR_DURATION +
      (this.selectedCombatant.hasTalent(TALENTS.HEED_MY_CALL_TALENT) ? HEED_MY_CALL_DURATION : 0) +
      BUFFER_MS;

    if (this.ancestorSourceId) {
      // find the first damage instance for an ancestor
      for (let index = 0; index < events.length; index += 1) {
        const event = events[index];
        if (!this._timestampCheck(event, ancestorDuration)) {
          // these sneaky buggers are out of order, tsk tsk
          if (event.type !== EventType.PhaseStart && event.type !== EventType.PhaseEnd) {
            break;
          }
        }

        // if there is a summon event, no need to do anything further with this instance
        if (event.type === EventType.Summon && this._targetCheck(event)) {
          instances.add(event.targetInstance);
          continue;
        }

        // damage event for an ancestor that's not already been included
        if (
          event.type === EventType.Damage &&
          this._sourceCheck(event) &&
          event.sourceInstance &&
          !instances.has(event.sourceInstance)
        ) {
          /** the only way this step will occur is if no summon event occured, so no need
           * to do any searching for the summon */
          instances.add(event.sourceInstance);

          // fabricate a summon pre-pull
          const summonEvent: SummonEvent = {
            sourceID: this.selectedCombatant.id,
            sourceIsFriendly: true,
            targetID: this.ancestorSourceId,
            targetInstance: event.sourceInstance,
            targetIsFriendly: true,
            ability: {
              guid: SPELLS.CALL_OF_THE_ANCESTORS_SUMMON.id,
              name: SPELLS.CALL_OF_THE_ANCESTORS_SUMMON.name,
              type: 8,
              abilityIcon: `${SPELLS.CALL_OF_THE_ANCESTORS_SUMMON.icon}.jpg`,
            },
            type: EventType.Summon,
            timestamp: this.owner.fight.start_time,
            __fabricated: true,
          };

          events.splice(0, 0, summonEvent);

          continue;
        }
      }
    }

    return events;
  }

  private _timestampCheck(event: AnyEvent, bufferMs: number): boolean {
    return event.timestamp - this.owner.fight.start_time < bufferMs;
  }

  private _targetCheck<T extends EventType>(event: Event<T>): event is TargettedEvent<T> {
    return HasTarget(event) && event.targetID === this.ancestorSourceId;
  }

  private _sourceCheck<T extends EventType>(event: Event<T>): event is SourcedEvent<T> {
    return HasSource(event) && event.sourceID === this.ancestorSourceId;
  }

  private _eventMatch(spellId: number, eventTypes: EventType[], event: AnyEvent): boolean {
    return HasAbility(event) && event.ability.guid === spellId && eventTypes.includes(event.type);
  }
}

export default ElementalPrepullNormalizer;
