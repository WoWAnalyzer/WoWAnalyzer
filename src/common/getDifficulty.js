import DIFFICULTIES from './DIFFICULTIES';

export default function getDifficulty(fight) {
  return DIFFICULTIES[fight.difficulty];
}
