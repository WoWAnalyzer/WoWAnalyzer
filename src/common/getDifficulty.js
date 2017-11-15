import DIFFICULTIES from './DIFFICULTIES';

export default function getDifficulty(fight) {
  return DIFFICULTIES[fight.difficulty] || ''; // difficulty may be undefined if we couldn't find it, which happens for things like trash
}
