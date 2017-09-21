import DIFFICULTIES from 'common/DIFFICULTIES';

export default function getDifficulty(fight) {
  return DIFFICULTIES[fight.difficulty];
}
