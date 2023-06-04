import spells from 'common/SPELLS/shaman';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import { AnyEvent, EventType } from 'parser/core/Events';
import CoreChanneling, {
  ChannelHandler,
  ChannelSpec,
  ChannelState,
  buffChannelSpec,
} from 'parser/shared/normalizers/Channeling';

const MAX_LOOK_FORWARD_MS = 10;

class Channeling extends CoreChanneling {
  constructor(options: Options) {
    CoreChanneling.CHANNEL_SPECS.push(
      instantCastNoBeginChannel(spells.LIGHTNING_BOLT.id),
      instantCastNoBeginChannel(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id),
    );
    super(options);
  }
}

function instantCastNoBeginChannel(spellId: number): ChannelSpec {
  const guids = [spellId];
  const handler: ChannelHandler = (
    event: AnyEvent,
    events: AnyEvent[],
    eventIndex: number,
    state: ChannelState,
  ) => {
    let found = false;
    if (event.type === EventType.BeginCast) {
      // find a matching cast within the look forward window
      for (let idx = eventIndex + 1; idx < events.length; idx += 1) {
        const laterEvent = events[idx];
        if (laterEvent.timestamp - event.timestamp > MAX_LOOK_FORWARD_MS) {
          break;
        }
        if (laterEvent.type === EventType.Cast || laterEvent.type === EventType.FreeCast) {
          found = laterEvent.ability.guid === spellId;
          events.splice(eventIndex, 1);
          break;
        }
      }
    }

    if (!found) {
      buffChannelSpec(spellId).handler(event, events, eventIndex, state);
    }
  };

  return {
    handler,
    guids,
  };
}

export default Channeling;
