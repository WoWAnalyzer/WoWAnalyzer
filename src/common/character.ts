export default interface Character {
  guid: number;
  id: number;
  region: string;
  realm: string;
  name: string;
  battlegroup: string | null;
  faction: number;
  class: number;
  race: number;
  gender: number;
  achievementPoints: number;
  spec: string;
  role: string;
  blizzardUpdatedAt: string;
  createdAt: string;
  lastSeenAt: string;
  talents: string;
  thumbnail?: string;
}
