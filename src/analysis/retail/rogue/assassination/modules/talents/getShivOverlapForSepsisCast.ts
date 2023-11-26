import SPELLS from 'common/SPELLS/rogue';
import Enemies from 'parser/shared/modules/Enemies';
import { SEPSIS_DEBUFF_DURATION } from '../../normalizers/SepsisLinkNormalizer';
import { BUFF_DROP_BUFFER } from 'parser/core/DotSnapshots';
import { TrackedBuffEvent } from 'parser/core/Entity';
import SepsisCast from './interfaces/SepsisCast';
import { SHIV_DURATION } from './Sepsis';
import CombatLogParser from 'parser/core/CombatLogParser';

type Params = {
  cast: Omit<SepsisCast, 'shivData'>;
  enemies: Enemies;
  owner: CombatLogParser;
};

/** Returns the amount of time that the Shiv debuff overlaps with the Sepsis debuff,
 * along with the amount of Shiv `TrackedBuffEvent`s found within the Sepsis window.
 * There will usually be 1 event for each debuff, but trying to cover the case where you chain Shivs to cover the full debuff.
 */
const getShivOverlapForSepsisCast = ({ cast, enemies, owner }: Params): SepsisCast['shivData'] => {
  const events: TrackedBuffEvent[] = [];
  let overlapMs = 0;
  let expectedOverlap = SHIV_DURATION;
  let overlapPercent = 0;

  if (cast.debuff) {
    const applyEvent = cast.debuff.applyEvent;
    const enemy = enemies.getEntity(cast.event);
    const shivs = enemy?.getBuffHistory(SPELLS.SHIV_DEBUFF.id, applyEvent.sourceID);
    let startTimePtr = applyEvent.timestamp;
    const sepsisEnd = cast.debuff?.end || applyEvent.timestamp + SEPSIS_DEBUFF_DURATION;
    const isLastSepsis = sepsisEnd >= owner.fight.end_time;
    shivs?.forEach((shivDebuff) => {
      startTimePtr = Math.max(startTimePtr, shivDebuff.timestamp);
      if (startTimePtr > sepsisEnd) {
        return;
      }
      if (shivDebuff.end && shivDebuff.end > startTimePtr) {
        overlapMs += Math.min(shivDebuff.end, sepsisEnd) - startTimePtr;
        events.push(shivDebuff);
        startTimePtr = shivDebuff.end;
      }
    });
    // check if sepsis debuff is set to expire after the fight ends so we don't expect all 8s of shiv to be used.
    if (isLastSepsis) {
      const remainingDurationAtFightEnd =
        cast.debuff.start + SEPSIS_DEBUFF_DURATION - owner.fight.end_time;
      expectedOverlap = SEPSIS_DEBUFF_DURATION - remainingDurationAtFightEnd;
    }
  }
  overlapMs = Math.min(overlapMs + BUFF_DROP_BUFFER, expectedOverlap);
  overlapPercent = Math.min(1, overlapMs / expectedOverlap);
  return { events, overlapMs, overlapPercent };
};

export default getShivOverlapForSepsisCast;
