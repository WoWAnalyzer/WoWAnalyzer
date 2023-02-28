import { AnyEvent, EventType } from 'parser/core/Events';
import metric, { Info } from 'parser/core/metric';
import SPELLS from 'common/SPELLS/classic/hunter';

/**
 * Returns the max amount of Kill Command casts considering the buff uptime.
 * Does not account for fluctuating cooldowns.
 */
const killCommandMaxCasts = (
  events: AnyEvent[],
  { playerId, fightStart, fightEnd }: Pick<Info, 'playerId' | 'fightStart' | 'fightEnd'>,
  cooldown: number,
) => {
  let lastAppliedAt: number | undefined;
  // The buff lasts 5 sec and the CD is 5 sec, so in theory with spell queueing a player may be able to achieve two casts. This is practically impossible though, since you can not cast KC immediately on proc. Therefore we assume the player needs 200ms to react. This is still optimistic, but this buffer is not intended to be a buffer for player reaction. We can use the recommended cast efficiency config for that.
  const buffer = 200;

  const maxCasts = events.reduce<number>((max, event) => {
    if (
      event.type === EventType.ApplyBuff &&
      event.targetID === playerId &&
      event.ability.guid === SPELLS.KILL_COMMAND.id
    ) {
      lastAppliedAt = event.timestamp;
    }
    if (
      event.type === EventType.RemoveBuff &&
      event.targetID === playerId &&
      event.ability.guid === SPELLS.KILL_COMMAND.id
    ) {
      if (max > 0 && lastAppliedAt === undefined) {
        // RemoveBuff should only be possible for prepull buffs, afterwards it can not occur
        throw new Error('Missing ApplyBuff event');
      }

      const start = lastAppliedAt !== undefined ? lastAppliedAt : fightStart;
      const duration = event.timestamp - start;
      const maxCastsInWindow = 1 + Math.floor((duration - buffer) / cooldown);

      max += maxCastsInWindow;
      lastAppliedAt = undefined;
    }
    return max;
  }, 0);

  if (lastAppliedAt !== undefined) {
    const duration = fightEnd - lastAppliedAt;
    const maxCastsInWindow = 1 + Math.floor((duration - buffer) / cooldown);

    return maxCasts + maxCastsInWindow;
  } else {
    return maxCasts;
  }
};

export default metric(killCommandMaxCasts);
