import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { SpellFilter } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';

class StandardChecks extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  castBreakdownDuringBuff(buff: SpellFilter) {
    const buffRemovals = this.eventHistory.last(
      undefined,
      undefined,
      Events.removebuff.by(SELECTED_PLAYER).spell(buff),
    );
    const castArray: number[][] = [];
    buffRemovals &&
      buffRemovals.forEach((e) => {
        const buffApply = this.eventHistory.last(
          1,
          undefined,
          Events.applybuff.by(SELECTED_PLAYER).spell(buff),
          e.timestamp,
        )[0];
        const buffDuration = e.timestamp - buffApply.timestamp;
        const castEvents = this.eventHistory.last(
          undefined,
          buffDuration,
          Events.cast.by(SELECTED_PLAYER),
          e.timestamp,
        );
        castEvents &&
          castEvents.forEach((c) => {
            const index = castArray.findIndex((arr) => arr.includes(c.ability.guid));
            if (index !== -1) {
              castArray[index][1] += 1;
            } else {
              castArray.push([c.ability.guid, 1]);
            }
          });
      });
    return castArray;
  }

  countCastsDuringBuff(buff: SpellFilter, cast?: SpellFilter | undefined) {
    const buffRemovals = this.eventHistory.last(
      undefined,
      undefined,
      Events.removebuff.by(SELECTED_PLAYER).spell(buff),
    );
    let totalCasts = 0;
    buffRemovals &&
      buffRemovals.forEach((e) => {
        const buffApply = this.eventHistory.last(
          1,
          undefined,
          Events.applybuff.by(SELECTED_PLAYER).spell(buff),
          e.timestamp,
        )[0];
        const buffDuration = e.timestamp - buffApply.timestamp;
        if (cast) {
          totalCasts += this.eventHistory.last(
            undefined,
            buffDuration,
            Events.cast.by(SELECTED_PLAYER).spell(cast),
            e.timestamp,
          ).length;
        } else {
          totalCasts += this.eventHistory.last(
            undefined,
            buffDuration,
            Events.cast.by(SELECTED_PLAYER),
            e.timestamp,
          ).length;
        }
      });
    return totalCasts;
  }
}

export default StandardChecks;
