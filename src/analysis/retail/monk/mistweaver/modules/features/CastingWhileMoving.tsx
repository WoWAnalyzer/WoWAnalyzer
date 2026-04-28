import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  BeginChannelEvent,
  CastEvent,
  RemoveBuffEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import MovementDuringBuffTracker from '../features/MovementDuringBuffTracker';
import { SOOTHING_MIST_CHANNEL_END } from '../../normalizers/EventLinks/EventLinkConstants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';
import DistanceMoved from 'parser/shared/modules/DistanceMoved';

class CastingWhileMoving extends Analyzer {
  static dependencies = {
    movementTracker: MovementDuringBuffTracker,
    distanceMoved: DistanceMoved,
  };

  protected movementTracker!: MovementDuringBuffTracker;
  protected distanceMoved!: DistanceMoved;

  soothingMistChannelEnds: Set<number> = new Set();

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.onSoothingMistCast,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell(TALENTS_MONK.SOOTHING_MIST_TALENT)
        .to(SELECTED_PLAYER),
      this.onSoothingMistEnd,
    );

    this.addEventListener(
      Events.BeginChannel.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onChannelStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onChannelEnd,
    );
  }

  onSoothingMistCast(event: CastEvent) {
    this.movementTracker.startTracking(event.ability.guid, event.timestamp);

    const channelEndEvents = GetRelatedEvents(event, SOOTHING_MIST_CHANNEL_END);
    if (channelEndEvents.length > 0) {
      const endEvent = channelEndEvents[0] as RemoveBuffEvent;
      this.soothingMistChannelEnds.add(endEvent.timestamp);
    }
  }

  onSoothingMistEnd(event: RemoveBuffEvent) {
    if (this.soothingMistChannelEnds.has(event.timestamp)) {
      this.movementTracker.stopTracking(TALENTS_MONK.SOOTHING_MIST_TALENT.id, event.timestamp);
      this.soothingMistChannelEnds.delete(event.timestamp);
    }
  }

  onChannelStart(event: CastEvent | BeginChannelEvent) {
    this.movementTracker.startTracking(event.ability.guid, event.timestamp);
  }

  onChannelEnd(event: RemoveBuffEvent) {
    this.movementTracker.stopTracking(event.ability.guid, event.timestamp);
  }

  statistic() {
    const soomMovement = this.movementTracker.getTotalMovement(
      TALENTS_MONK.SOOTHING_MIST_TALENT.id,
    );
    const cjlMovement = this.movementTracker.getTotalMovement(SPELLS.CRACKLING_JADE_LIGHTNING.id);
    const totalMovement = soomMovement + cjlMovement;
    const percentOfTotal =
      this.distanceMoved.totalDistanceMoved > 0
        ? totalMovement / this.distanceMoved.totalDistanceMoved
        : 0;

    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT()}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            <div>
              <SpellLink spell={TALENTS_MONK.SOOTHING_MIST_TALENT} />: {formatNumber(soomMovement)}{' '}
              yards
            </div>
            <div>
              <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} />: {formatNumber(cjlMovement)}{' '}
              yards
            </div>
          </>
        }
      >
        <div className={`pad boring-text`}>
          <label>Casting while moving</label>
          <div className="value">
            ≈ {formatNumber(totalMovement)} yards{' '}
            <small>{formatPercentage(percentOfTotal)}% of total</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default CastingWhileMoving;
