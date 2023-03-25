import talents from 'common/TALENTS/monk';
import { AddStaggerEvent, EventType, RemoveStaggerEvent } from 'parser/core/Events';

import type { TrackedStaggerData } from './analyzer';

const MAX_CHARGES = 2;
const MIN_GAP = 1000; // PB has a 1000 ms cd with itself

export type MissedPurifyData = {
  hit: TrackedStaggerData;
  amountPurified: number;
  state: State;
};

function shouldPurify(
  hit: TrackedStaggerData,
  allHits: TrackedStaggerData[],
  hitIndex: number,
  purifyThreshold: number,
  pool: number,
): boolean {
  if (hit.event.type === EventType.RemoveStagger) {
    return false;
  }

  if (hit.purifyCharges === 0 || pool / 2 < purifyThreshold) {
    return false;
  }

  // don't purify if we die in less than 500ms. this hit was probably just a one-shot
  if (
    hitIndex < allHits.length - 1 &&
    allHits[hitIndex + 1].event.trigger?.type === EventType.Death &&
    allHits[hitIndex + 1].event.timestamp - hit.event.timestamp < 500
  ) {
    return false;
  }

  return true;
}

export default function solver(
  allHits: TrackedStaggerData[],
  estBrewCooldown: number,
  purifyThreshold: number,
): MissedPurifyData[] {
  let bestSolutionSize = 0;
  let bestSolution: MissedPurifyData[] = [];
  allHits.forEach((hit, ix) => {
    if (!shouldPurify(hit, allHits, ix, purifyThreshold, hit.event.newPooledDamage)) {
      return;
    }

    const solution = identifyPurifies(
      hit,
      allHits.slice(ix + 1),
      { estBrewCooldown, threshold: purifyThreshold },
      {
        charges: hit.purifyCharges!,
        remainingBrewCooldown: hit.remainingPurifyCooldown!,
        staggerPool: hit.event.newPooledDamage,
      },
    );
    const size = solution.map((datum) => datum.amountPurified).reduce((a, b) => a + b);

    if (size > bestSolutionSize) {
      bestSolution = solution;
      bestSolutionSize = size;
    }
  });

  return bestSolution;
}

type Constants = {
  estBrewCooldown: number;
  threshold: number;
};

type State = {
  charges: number;
  remainingBrewCooldown: number;
  staggerPool: number;
};

/// identify missing purifies recursively
function identifyPurifies(
  hit: TrackedStaggerData,
  hits: TrackedStaggerData[],
  consts: Constants,
  { charges, remainingBrewCooldown, staggerPool }: State,
): MissedPurifyData[] {
  const { estBrewCooldown, threshold } = consts;
  const amountPurified = staggerPool / 2;

  const missed: MissedPurifyData = {
    amountPurified,
    hit,
    state: { charges, remainingBrewCooldown, staggerPool },
  };

  // update state values to reflect the purify that just occurred
  let remainingCooldown = charges === MAX_CHARGES ? estBrewCooldown : remainingBrewCooldown;
  let remainingCharges = charges - 1;

  // the time when we next gain a brew charge
  const nextBrewCharge = hit.event.timestamp + remainingCooldown;
  const nextCastable = hit.event.timestamp + MIN_GAP;

  let nextStaggerPool = staggerPool - amountPurified;
  const next = hits.findIndex((hit, ix) => {
    const { event } = hit;
    if (event.type === EventType.RemoveStagger) {
      nextStaggerPool -= event.amount;
      nextStaggerPool = Math.max(0, nextStaggerPool);
    } else {
      nextStaggerPool += event.amount;
    }

    const castable =
      event.timestamp >= nextCastable &&
      (remainingCharges > 0 || event.timestamp >= nextBrewCharge);
    const worthCasting = shouldPurify(hit, hits, ix, threshold, nextStaggerPool);

    return castable && worthCasting;
  });

  if (next === -1) {
    // no further useful purifies, stop
    return [missed];
  } else {
    const nextHit = hits[next];

    // add a charge
    if (nextHit.event.timestamp > nextBrewCharge) {
      remainingCharges = Math.min(MAX_CHARGES, remainingCharges + 1);
    }
    remainingCooldown =
      remainingCharges === MAX_CHARGES
        ? 0
        : (remainingCooldown - (nextHit.event.timestamp - hit.event.timestamp)) % estBrewCooldown;
    if (remainingCooldown < 0) {
      remainingCooldown = remainingCooldown + estBrewCooldown;
    }
    return [
      missed,
      ...identifyPurifies(hits[next], hits.slice(next + 1), consts, {
        charges: remainingCharges,
        remainingBrewCooldown: remainingCooldown,
        staggerPool: nextStaggerPool,
      }),
    ];
  }
}

/**
 * Generate a sequence of potential stagger events given the possible `missedPurifies`.
 * This doesn't correctly downscale the stagger ticks, but :shrug:
 */
export function potentialStaggerEvents(
  missedPurifies: MissedPurifyData[],
  stagger: Array<AddStaggerEvent | RemoveStaggerEvent>,
): Array<Pick<AddStaggerEvent, 'newPooledDamage' | 'timestamp'>> {
  const ix = stagger.findIndex(
    ({ timestamp }) => timestamp >= missedPurifies[0].hit.event.timestamp,
  );
  let staggerPool = stagger[ix].newPooledDamage - stagger[ix].amount;

  const events = (
    stagger as Array<
      Pick<AddStaggerEvent | RemoveStaggerEvent, 'type' | 'amount' | 'timestamp' | 'trigger'>
    >
  )
    .slice(ix)
    .concat(
      missedPurifies.map((miss) => ({
        timestamp: miss.hit.event.timestamp,
        amount: miss.amountPurified,
        type: EventType.RemoveStagger,
      })),
    )
    .sort((a, b) => a.timestamp - b.timestamp);

  return events.map(({ type, amount, timestamp, trigger }) => {
    if (
      type === EventType.RemoveStagger &&
      (trigger === undefined || trigger.ability.guid === talents.PURIFYING_BREW_TALENT.id)
    ) {
      staggerPool -= staggerPool / 2;
    } else if (type === EventType.RemoveStagger) {
      staggerPool -= amount;
    } else {
      staggerPool += amount;
    }
    staggerPool = Math.max(0, staggerPool);

    return {
      newPooledDamage: staggerPool,
      timestamp,
    };
  });
}
