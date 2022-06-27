import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { SpellInfo } from 'parser/core/EventFilter';
import { AnyEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';

class StandardChecks extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  castBreakdownDuringBuff(buff: SpellInfo) {
    /**
     * @param buff the spell object for the buff
     * @returns an array containing each unique spell cast and the number of times it was cast
     */
    const buffRemovals: AnyEvent[] = this.eventHistory.last(
      undefined,
      undefined,
      Events.removebuff.by(SELECTED_PLAYER).spell(buff),
    );
    if (this.selectedCombatant.hasBuff(buff.id, this.owner.fight.end_time - 1)) {
      buffRemovals.push(this.eventHistory.last(1, undefined, Events.fightend)[0]);
    }
    const castArray: number[][] = [];
    buffRemovals &&
      buffRemovals.forEach((e) => {
        const buffApply = this.eventHistory.last(
          1,
          undefined,
          Events.applybuff.by(SELECTED_PLAYER).spell(buff),
          e.timestamp,
        )[0];
        const buffDuration = e.timestamp - buffApply.timestamp - 1;
        const castEvents = this.eventHistory.last(
          undefined,
          buffDuration,
          Events.cast.by(SELECTED_PLAYER),
          e.timestamp,
        );
        castEvents &&
          castEvents.forEach((c) => {
            if (CASTS_THAT_ARENT_CASTS.includes(c.ability.guid)) {
              return;
            }
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

  countCastsDuringBuff(buff: SpellInfo, cast?: SpellInfo | undefined) {
    /**
     * @param buff the spell object for the buff
     * @param cast an optional cast spell object to count. Omit or leave undefined to count all casts
     */
    const buffRemovals: AnyEvent[] = this.eventHistory.last(
      undefined,
      undefined,
      Events.removebuff.by(SELECTED_PLAYER).spell(buff),
    );
    if (this.selectedCombatant.hasBuff(buff.id, this.owner.fight.end_time - 1)) {
      buffRemovals.push(this.eventHistory.last(1, undefined, Events.fightend)[0]);
    }
    let totalCasts = 0;
    buffRemovals &&
      buffRemovals.forEach((e) => {
        const buffApply = this.eventHistory.last(
          1,
          undefined,
          Events.applybuff.by(SELECTED_PLAYER).spell(buff),
          e.timestamp,
        )[0];
        const buffDuration = e.timestamp - buffApply.timestamp - 1;
        const castEvents = this.eventHistory.last(
          undefined,
          buffDuration,
          cast ? Events.cast.by(SELECTED_PLAYER).spell(cast) : Events.cast.by(SELECTED_PLAYER),
          e.timestamp,
        );
        castEvents &&
          castEvents.forEach((c) => {
            if (CASTS_THAT_ARENT_CASTS.includes(c.ability.guid)) {
              return;
            } else {
              totalCasts += 1;
            }
          });
      });
    return totalCasts;
  }
}

export default StandardChecks;
