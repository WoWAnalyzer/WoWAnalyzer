interface CharacterProfile {
  id: number;
  region: string;
  realm: string;
  name: string;
  faction: number;
  class: number;
  race: number;
  gender: number;
  achievementPoints: number;
  thumbnail: string;
  spec: string;
  role: string;
  talents: string;
  heartOfAzeroth: unknown;
  blizzardUpdatedAt: string;
  createdAt: string;
  lastSeenAt: string;
}

export default CharacterProfile;
