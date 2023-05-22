import { Condition, tenseAlt } from '../index';
import { TIERS } from 'game/TIERS';

export default function hasTierBonus(tier: TIERS, minPieces: number): Condition<boolean> {
  return {
    key: `hasTierBonus-${tier}.${minPieces}`,
    init: ({ combatant }) =>
      minPieces >= 4
        ? combatant.has4PieceByTier(tier)
        : minPieces >= 2
        ? combatant.has2PieceByTier(tier)
        : false,
    update: (state, _event) => state,
    validate: (state, _event) => state,
    describe: (tense) => (
      <>you {tenseAlt(tense, 'have', 'had')} to activate the 2-piece T30 bonus</>
    ),
  };
}
