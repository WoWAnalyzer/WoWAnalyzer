import { TIERS } from 'game/TIERS';
import { Condition } from '../index';

export function has2PieceByTier(tier: TIERS): Condition<boolean> {
  return {
    key: `has2PieceByTier-${tier}`,
    init: ({ combatant }) => combatant.has2PieceByTier(tier),
    update: (state, _event) => state,
    validate: (state, _event) => state,
    describe: () => <></>,
  };
}

export function has4PieceByTier(tier: TIERS): Condition<boolean> {
  return {
    key: `has2PieceByTier-${tier}`,
    init: ({ combatant }) => combatant.has4PieceByTier(tier),
    update: (state, _event) => state,
    validate: (state, _event) => state,
    describe: () => <></>,
  };
}
