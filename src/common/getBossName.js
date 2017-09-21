import getDifficulty from './getDifficulty';

export default function getBossName(fight, withDifficulty = true) {
  return withDifficulty ? `${getDifficulty(fight)} ${fight.name}` : fight.name;
}
