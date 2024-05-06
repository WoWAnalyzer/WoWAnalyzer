import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatDuration } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import { calculateEffectiveDamageFromCritDamageIncrease } from 'parser/core/EventCalculateLib';
import {
  AddRelatedEvent,
  AnyEvent,
  DamageEvent,
  EmpowerEndEvent,
  EventType,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Module';
import { SPELLWEAVERS_DOMINANCE_CRIT_MULTIPLIER } from '../../constants';

export const ES_FROM_CAST = 'ESFromCast';

const MAX_SEARCH_BUFFER_MS = 1_500;
export const MAX_ES_HIT_BUFFER_MS = 20;

const ETERNITY_SURGE_IDS = new Set<number>([
  SPELLS.ETERNITY_SURGE.id,
  SPELLS.ETERNITY_SURGE_FONT.id,
  SPELLS.ETERNITY_SURGE_DAM.id,
]);

/**
 * The purpose of this Normalizer is to link Eternity Surge hits to EmpowerEnd events.
 *
 * The reason this is needed is because of Scintillation which is a talent that makes
 * Disintegrate having a chance to proc Eternity Surge on each tick.
 *
 * Due to the nature of Eternity Surge and its varying traveltime depending on the distance
 * to your target, making this with a normal CastLinkNormalizer is not really feasible.
 * The travel time ranges from ~500ms -> ~1350ms, with an natural variance up to ~100ms.
 * An additional problem is that Scintillation proc hits can be very close to cast hits,
 * which needs to be resolved to figure out which hits should be contributed to the casts.
 *
 * We can't accurately link Eternity Surge hits from Scintillation procs to Disintegrate ticks
 * due to above mentioned travel time problem, so we will only add Links for Eternity Surge casts,
 * and treat non linked Eternity Surge hits as if they were Scintillation procs.
 *
 * Effectively this is a perfectly adequate solution for what we currently need for our analysis.
 * There could come a time where having Scintillation procs linked, due to damage calculation
 * being done on cast, eg. increasing Shattering Star analysis accuracy, but the gain versus
 * the headache is not really worth the effort.
 */
class EternitySurgeNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
    /** NOTE: For now since we only use the links for Scintillation analysis
     * we will only enable this if we have Scintillation */
    this.active = this.selectedCombatant.hasTalent(TALENTS.SCINTILLATION_TALENT);
  }

  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    const hitsPerEmpowerRank = this.selectedCombatant.hasTalent(TALENTS.ETERNITYS_SPAN_TALENT)
      ? 2
      : 1;
    const hasScintillation = this.selectedCombatant.hasTalent(TALENTS.SCINTILLATION_TALENT);
    const hasSpellweaversDominance = this.selectedCombatant.hasTalent(
      TALENTS.SPELLWEAVERS_DOMINANCE_TALENT,
    );

    let currentEternitySurgeCast: EmpowerEndEvent | undefined;
    let damageWindows: DamageEvent[][] = [];

    /** Reset our internal state */
    const resetDamageWindows = () => {
      console.log('cleanup');
      if (currentEternitySurgeCast) {
        fixedEvents.push(currentEternitySurgeCast);
      }
      damageWindows = [];
      currentEternitySurgeCast = undefined;
      console.groupEnd();
    };

    /** Add CastLinks between Eternity Surge cast and associated hits */
    const addLinks = (damageEvent: DamageEvent) => {
      if (!currentEternitySurgeCast) {
        console.warn(
          `No Eternity Surge to link to @${formatDuration(damageEvent.timestamp - this.owner.fight.start_time)}`,
        );
        return;
      }
      AddRelatedEvent(currentEternitySurgeCast, ES_FROM_CAST, damageEvent);
      AddRelatedEvent(damageEvent, ES_FROM_CAST, currentEternitySurgeCast);
    };

    /** Figure out which damage window is from the cast */
    const findCastWindow = () => {
      if (damageWindows.length === 1) {
        return 0;
      }

      /** We can have multiple damage windows in close proximity to each other
       * We need to figure out which one is from the cast
       * we do this by comparing the amount of damage in each window
       * and choosing the one with the most damage, since Scintillation procs are
       * 50% of base damage - it can also be determined by the amount of hits
       * since procs can only ever hit a max of 1/2 targets depending on talent
       *
       * Close to always we will only have one window so we'll only run the compare logic if
       * there is more than one window */
      const { windowIdxToUse } = damageWindows.reduce(
        (acc, window, idx) => {
          // We've already found the correct window, based on hit count
          if (acc.maxWindowSize > hitsPerEmpowerRank) {
            return acc;
          }

          // We hit more targets than is possible from procs so must be correct window
          if (window.length > hitsPerEmpowerRank) {
            acc.windowIdxToUse = idx;
            acc.maxWindowSize = window.length;
            return acc;
          }

          // We'll just compare the first events in the windows
          const initialEvent = window[0];
          let rawAmount = initialEvent.amount + (initialEvent.absorbed ?? 0);
          let normalizedAmount = 0;

          /** If it's a crit we need to normalize the value, a crit normally means double amount,
           * but we also have a talent that increases it 30%, so we need to decrease that amount too */
          const isCrit = initialEvent.hitType === HIT_TYPES.CRIT;
          if (isCrit) {
            if (hasSpellweaversDominance) {
              rawAmount -= calculateEffectiveDamageFromCritDamageIncrease(
                initialEvent,
                SPELLWEAVERS_DOMINANCE_CRIT_MULTIPLIER,
              );
            }
            normalizedAmount = rawAmount / 2;
          } else {
            normalizedAmount = rawAmount;
          }

          console.info(
            'Window',
            idx,
            'rawAmount',
            rawAmount,
            'amount',
            normalizedAmount,
            'isCrit',
            isCrit,
            'hasSpellweaver',
            hasSpellweaversDominance,
            'hasScint',
            hasScintillation,
            'window.length',
            window.length,
          );

          // Initial window to compare against
          if (idx === 0) {
            acc.windowIdxToUse = 0;
            acc.maxVal = normalizedAmount;
            acc.maxWindowSize = window.length;
            return acc;
          }

          // The current windows initial hit does more damage than the previous
          if (normalizedAmount > acc.maxVal) {
            acc.maxVal = normalizedAmount;
            acc.windowIdxToUse = idx;
          }

          return acc;
        },
        {
          windowIdxToUse: 0,
          maxVal: 0,
          maxWindowSize: 0,
        },
      );

      return windowIdxToUse;
    };

    /** Resolve damage windows to figure out which ones should be linked */
    const resolveDamageWindows = () => {
      // No damage events so just bail
      if (!damageWindows.length) {
        return resetDamageWindows();
      }

      // No Eternity Surge cast, so damage events are from Scintillation procs
      if (!currentEternitySurgeCast) {
        damageWindows.forEach((window) => fixedEvents.push(...window));

        return resetDamageWindows();
      }

      // We don't have Scintillation and therefore all hits are from Cast
      if (!hasScintillation) {
        if (damageWindows.length > 1) {
          console.warn(
            `Unexpected amount of Eternity Surge damage windows @${formatDuration(currentEternitySurgeCast.timestamp - this.owner.fight.start_time)}`,
            damageWindows,
          );
        }

        damageWindows.forEach((window) => {
          window.forEach((e) => {
            addLinks(e);
            fixedEvents.push(e);
          });
        });

        return resetDamageWindows();
      }

      const castWindowIdx = findCastWindow();
      console.info('Using window', castWindowIdx, 'for', damageWindows);

      damageWindows.forEach((window, windowIdx) => {
        window.forEach((e) => {
          if (windowIdx === castWindowIdx) {
            addLinks(e);
          }
          fixedEvents.push(e);
        });
      });

      resetDamageWindows();
    };

    for (const event of events) {
      if (event.type !== EventType.Damage && event.type !== EventType.EmpowerEnd) {
        fixedEvents.push(event);
        continue;
      }

      if (!ETERNITY_SURGE_IDS.has(event.ability.guid)) {
        fixedEvents.push(event);
        continue;
      }

      if (event.type === EventType.EmpowerEnd) {
        console.group(
          'Resolving damage events: EmpowerEnd @',
          formatDuration(event.timestamp - events[0].timestamp),
          damageWindows,
          currentEternitySurgeCast,
        );
        resolveDamageWindows();

        currentEternitySurgeCast = event;
        continue;
      }

      if (!currentEternitySurgeCast) {
        fixedEvents.push(event);
        continue;
      }

      const diff = event.timestamp - currentEternitySurgeCast.timestamp;
      if (diff >= MAX_SEARCH_BUFFER_MS) {
        console.group(
          'Resolving damage events: too much delay @',
          formatDuration(event.timestamp - events[0].timestamp),
          damageWindows,
          currentEternitySurgeCast,
        );
        resolveDamageWindows();
        fixedEvents.push(event);
        continue;
      }

      const currentAmountOfWindows = damageWindows.length;
      if (!currentAmountOfWindows) {
        // Start a new window
        damageWindows.push([event]);
        continue;
      }

      const currentWindow = damageWindows[currentAmountOfWindows - 1];
      const timeSinceLastHit = event.timestamp - currentWindow[0].timestamp;

      if (timeSinceLastHit < MAX_ES_HIT_BUFFER_MS) {
        // Add to current window
        currentWindow.push(event);
      } else {
        // Start a new window
        damageWindows.push([event]);
      }
    }

    // cleanup
    console.group('Fight ended, resolving damage events');
    resolveDamageWindows();

    return fixedEvents;
  }
}

export default EternitySurgeNormalizer;
