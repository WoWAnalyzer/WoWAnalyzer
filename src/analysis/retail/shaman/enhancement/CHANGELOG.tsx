import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/shaman';
import { Seriousnes } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2024, 9, 14), <>Updating <SpellLink spell={TALENTS.HOT_HAND_TALENT} /> and <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> guide sections for priority changes</>, Seriousnes),
  change(date(2024, 9, 12), <>APL updates</>, Seriousnes),  
  change(date(2024, 9, 12), <><SpellLink spell={TALENTS.TEMPEST_TALENT} /> now stacks up to 2 times</>, Seriousnes),
  change(date(2024, 8, 30), <>Updated maelstrom tracker, implementing hero talents (Stormbringer)</>, Seriousnes),
  change(date(2024, 7, 26), <>Initial update for The War Within.</>, Seriousnes),
];
