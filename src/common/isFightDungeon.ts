import { WCLFight } from 'parser/core/Fight';
import mythicplusseasonone from 'game/raids/mythicplusseasonone';
import mythicplusseasontwo from 'game/raids/mythicplusseasontwo';
import typedKeys from 'common/typedKeys';

const mythicPlusSeasonOneDungeons = typedKeys(mythicplusseasonone.bosses).map(
  (key) => mythicplusseasonone.bosses[key].id,
);
const mythicPlusSeasonTwoDungeons = typedKeys(mythicplusseasontwo.bosses).map(
  (key) => mythicplusseasontwo.bosses[key].id,
);
const dungeons = [...mythicPlusSeasonOneDungeons, ...mythicPlusSeasonTwoDungeons];

export const isFightDungeon = (fight: WCLFight) => dungeons.includes(fight.boss);
