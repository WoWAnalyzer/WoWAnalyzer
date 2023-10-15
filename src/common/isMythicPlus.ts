import { type WCLFight } from 'parser/core/Fight';
import DIFFICULTIES from 'game/DIFFICULTIES';

export const isMythicPlus = (fight: WCLFight) =>
  fight.difficulty === DIFFICULTIES.MYTHIC_PLUS_DUNGEON;
