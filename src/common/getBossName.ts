import { getLabel } from 'game/DIFFICULTIES';
import { WCLFight } from 'parser/core/Fight';

export default function getBossName(fight: WCLFight, withDifficulty: boolean = true): string {
  return withDifficulty
    ? `${getLabel(fight.difficulty, fight.hardModeLevel)} ${fight.name}`
    : fight.name;
}
