import Channeling from 'parser/shared/normalizers/Channeling';
import { AnyEvent, EventType } from 'parser/core/Events';
import LivelyTotemsNormalizer, { isLivelyTotemsChainHealBeginCast } from './LivelyTotemsNormalizer';

type ChannelState = Parameters<Channeling['defaultHandler']>[3];

/**
 * The Lively Totems Chain Heal is instant, but the log still contains a begincast for it.
 * Core Channeling would turn that begincast into a fabricated beginchannel, which then triggers a GCD.
 * We skip those begincasts so no channel is fabricated; the cast itself stays a normal cast.
 */
class RestoChanneling extends Channeling {
  static dependencies = {
    ...Channeling.dependencies,
    // Must run first, so the begincasts are already linked when channels are built.
    livelyTotemsNormalizer: LivelyTotemsNormalizer,
  };

  defaultHandler(
    event: AnyEvent,
    events: AnyEvent[],
    eventIndex: number,
    channelState: ChannelState,
  ): void {
    if (event.type === EventType.BeginCast && isLivelyTotemsChainHealBeginCast(event)) {
      return;
    }
    super.defaultHandler(event, events, eventIndex, channelState);
  }
}

export default RestoChanneling;
