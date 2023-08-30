import { ResourceChangeEvent } from 'parser/core/Events';

interface GainWaste {
  gain: number;
  waste: number;
}

/**
 * Calculates the increase that a multiplicative `increase` has had on `event`.
 */
export default function calculateResourceIncrease(
  event: ResourceChangeEvent,
  increase: number,
): { base: GainWaste; bonus: GainWaste } {
  const rawResourceChange = event.resourceChange;
  // Find our increase
  const resourceIncrease = rawResourceChange - rawResourceChange / (1 + increase);
  const baseResource = rawResourceChange - resourceIncrease;
  // Noramlize to no decimals (no fractional resources)
  const noDecimalResourceIncrease = Math.ceil(resourceIncrease);
  const noDecmialBaseResource = Math.ceil(baseResource);
  // Find how much waste we have for each event
  const resourceIncreaseWaste =
    noDecimalResourceIncrease - Math.max(noDecimalResourceIncrease - event.waste, 0);
  const remainingWaste = Math.max(event.waste - resourceIncreaseWaste, 0);
  const baseResourceWaste =
    noDecmialBaseResource - Math.max(noDecmialBaseResource - remainingWaste, 0);

  return {
    base: {
      gain: noDecmialBaseResource,
      waste: baseResourceWaste,
    },
    bonus: {
      gain: noDecimalResourceIncrease,
      waste: resourceIncreaseWaste,
    },
  };
}
