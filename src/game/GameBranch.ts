import Expansion, { CLASSIC_EXPANSION, RETAIL_EXPANSION } from './Expansion';

enum GameBranch {
  Retail = 'retail',
  Classic = 'classic',
}

const CURRENT_EXPANSIONS = {
  [GameBranch.Retail]: RETAIL_EXPANSION,
  [GameBranch.Classic]: CLASSIC_EXPANSION,
} satisfies Record<GameBranch, Expansion>;

export const currentExpansion = (branch: GameBranch): Expansion => CURRENT_EXPANSIONS[branch];

export default GameBranch;
