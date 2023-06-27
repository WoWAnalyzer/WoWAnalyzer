const DIFFICULTIES: {
  [key: string]: number;
} = {
  LFR_RAID: 1,
  NORMAL_RAID: 3,
  HEROIC_RAID: 4,
  MYTHIC_RAID: 5,
  MYTHIC_PLUS_DUNGEON: 10,
};
export default DIFFICULTIES;

export function getLabel(difficulty?: number, hardModeLevel?: number) {
  const isHardMode = hardModeLevel ?? 0;
  switch (difficulty) {
    case DIFFICULTIES.LFR_RAID:
      return `LFR`;
    case DIFFICULTIES.NORMAL_RAID:
      if (isHardMode > 0) {
        return `Hardmode`;
      } else {
        return `Normal`;
      }
    case DIFFICULTIES.HEROIC_RAID:
      return `Heroic`;
    case DIFFICULTIES.MYTHIC_RAID:
      return `Mythic`;
    case DIFFICULTIES.MYTHIC_PLUS_DUNGEON:
      return `Mythic+`;
    default:
      return `Unknown difficulty`;
  }
}
