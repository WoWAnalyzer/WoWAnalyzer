import { change, date } from 'common/changelog';
import { jazminite, HerzBlutRaffy, beckeeh } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/classic/priest';

export default [
  change(date(2023, 11, 20), 'Add missing Shadow Priest Abilities + cleanup', jazminite),
  change(date(2023, 8, 12), <>Show correct uptime percent for <SpellLink spell={SPELLS.VAMPIRIC_TOUCH}/>.</>, beckeeh),
  change(date(2023, 2, 25), 'Add Shadow Priest by using _template/caster. Update Priest Spells and lowerRank Spells', HerzBlutRaffy),
];
