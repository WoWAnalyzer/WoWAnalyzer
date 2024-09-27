import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { Seriousnes } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2024, 9, 27), <>Consolidate and correct issues with APLs</>, Seriousnes),  
  change(date(2024, 9, 20), <>Fixing <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> and <SpellLink spell={SPELLS.LIGHTNING_BOLT} /> usage in APL</>, Seriousnes),
  change(date(2024, 9, 18), <><SpellLink spell={TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT} /> reduced to 1 sec per stack of <SpellLink spell={SPELLS.MAELSTROM_WEAPON} /> gained</>, Seriousnes),
  change(date(2024, 9, 17), <>Include <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> in APL check</>, Seriousnes),
  change(date(2024, 9, 14), <>Updating <SpellLink spell={TALENTS.HOT_HAND_TALENT} /> and <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> guide sections for priority changes</>, Seriousnes),
  change(date(2024, 9, 12), <>APL updates</>, Seriousnes),  
  change(date(2024, 9, 12), <><SpellLink spell={TALENTS.TEMPEST_TALENT} /> now stacks up to 2 times</>, Seriousnes),
  change(date(2024, 8, 30), <>Updated maelstrom tracker, implementing hero talents (Stormbringer)</>, Seriousnes),
  change(date(2024, 7, 26), <>Initial update for The War Within.</>, Seriousnes),
];
