import type { Boss } from 'game/raids';

// WCL uses this offset for repeats of bosses
const REPEAT_BOSS_OFFSET = 50000;

export function buildBoss(params: {
  id: number;
  name: string;
  background?: string;
  timeline?: Boss['fight']['timeline'];
}): Boss {
  return {
    ...params,
    headshot: `https://assets.rpglogs.com/img/warcraft/bosses/${params.id % REPEAT_BOSS_OFFSET}-icon.jpg`,
    icon: `https://assets.rpglogs.com/img/warcraft/bosses/${params.id % REPEAT_BOSS_OFFSET}-icon.jpg`,
    fight: {
      timeline: params.timeline,
    },
  };
}
