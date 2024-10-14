import type { Boss } from 'game/raids';

export function buildBoss(params: { id: number; name: string; background?: string }): Boss {
  return {
    ...params,
    headshot: `https://assets.rpglogs.com/img/warcraft/bosses/${params.id}-icon.jpg`,
    icon: `https://assets.rpglogs.com/img/warcraft/bosses/${params.id}-icon.jpg`,
    fight: {},
  };
}
