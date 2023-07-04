import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { Sharrq, ToppleTheNun } from 'CONTRIBUTORS';

export default [
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
	change(date(2023, 6, 27), <>Added <SpellLink spell={TALENTS.TEMPORAL_WARP_TALENT} /> to list of Bloodlust Buffs.</>, Sharrq),
	change(date(2023, 2, 12), <>Bumped support up to 10.0.5 and fixed an issue that could cause every <SpellLink spell={TALENTS.RUNE_OF_POWER_TALENT} /> cast to count as overlapped.</>, Sharrq),
	change(date(2023, 1, 14), `Added a link to Toegrinder's Mage Hub guide on the About page. Removed link to Icy Veins and Altered Time forums.`, Sharrq),
	change(date(2023, 1, 14), `Upgraded Frost Mage support to 10.0.2 and marked as Supported. Also removed Dambroda from spec maintainers.`, Sharrq),
	change(date(2023, 1, 14), `Reviewed all Suggestions, Tooltips, and Checklist items to ensure the wording is accurate for Dragonflight`, Sharrq),
	change(date(2023, 1, 14), <>Removed <SpellLink spell={TALENTS.BLAST_WAVE_TALENT} /> and <SpellLink spell={TALENTS.ICE_NOVA_TALENT} /> from Cast Efficiency.</>, Sharrq),
	change(date(2023, 1, 14), <>Fixed an issue where <SpellLink spell={TALENTS.ICY_PROPULSION_TALENT} /> was not counting cooldown reduction outside of <SpellLink spell={TALENTS.ICY_VEINS_TALENT} />.</>, Sharrq),
	change(date(2023, 1, 14), <>Rebuilt the <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> module and removed the messages about using <SpellLink spell={TALENTS.FLURRY_TALENT} /> without <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} />.</>, Sharrq),
	change(date(2022, 12, 17), <>Fixed an error that was improperly counting <SpellLink spell={SPELLS.WINTERS_CHILL} /> Shattered Casts and Pre Casts.</>, Sharrq),
  change(date(2022, 12, 13), <>Fixed timeline buff highlights for <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> and <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} />.</>, Sharrq),
  change(date(2022, 12, 13), <>Updated <SpellLink spell={TALENTS.SHIFTING_POWER_TALENT} /> CDR Spell List.</>, Sharrq),
  change(date(2022, 12, 13), <>Fixed <SpellLink spell={TALENTS.ICY_PROPULSION_TALENT} /> CDR tracking.</>, Sharrq),
  change(date(2022, 12, 13), <>Fixed <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> proc usage tracking.</>, Sharrq),
  change(date(2022, 12, 13), <>Fixed <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> munched proc tracking and used proc usage tracking.</>, Sharrq),
  change(date(2022, 12, 13), `General fixes for incorrect Spell IDs, leftover Shadowlands stuff, etc.`, Sharrq),
  change(date(2022, 10, 30), `Update Dragonflight SPELLS, Abilities, and Buffs`, Sharrq),
  change(date(2022, 9, 29), `Dragonflight initial cleanup`, Sharrq),
];
