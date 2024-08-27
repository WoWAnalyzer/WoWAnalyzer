import { ResourceChangeEvent } from 'parser/core/Events';

interface GainWaste {
  gain: number;
  waste: number;
}

/**
 * Calculates the increase that a multiplicative `increase` has had on `event`.
 *
 * - `gain` is the effective gain, not including waste
 * - `waste` is the amount of waste that was generated
 *
 * If you want something corresponding `resourceChange`, use `gain + waste`.
 */
export default function calculateResourceIncrease(
  event: ResourceChangeEvent,
  increase: number,
): { base: GainWaste; bonus: GainWaste } {
  const rawResourceChange = event.resourceChange;
  // Find our increase
  const resourceIncrease = Math.ceil(rawResourceChange - rawResourceChange / (1 + increase));
  const baseResource = rawResourceChange - resourceIncrease;
  // Find how much waste we have for each event
  const resourceIncreaseWaste = resourceIncrease - Math.max(resourceIncrease - event.waste, 0);
  const remainingWaste = event.waste - resourceIncreaseWaste;

  return {
    base: {
      gain: baseResource - remainingWaste,
      waste: remainingWaste,
    },
    bonus: {
      gain: resourceIncrease - resourceIncreaseWaste,
      waste: resourceIncreaseWaste,
    },
  };
}
