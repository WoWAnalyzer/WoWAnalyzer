import { change, date } from 'common/changelog';
import spells from 'common/SPELLS/monk';
import talents from 'common/TALENTS/monk';
import { Durpn, Hursti, nullDozzer, Tenooki, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 10, 26), <>Re-enable <SpellLink spell={spells.FISTS_OF_FURY_CAST}/> being a channel, and fix associated incorrect APL failures</>, Durpn),
  change(date(2023, 9, 25), 'Fix drilldown link for Chi details', nullDozzer),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 5, 18), <>Fixed <SpellLink spell={spells.BLACKOUT_KICK}/> being flagged as an incorrect cast in the APL/Timeline when it reset <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /></>, Durpn),
  change(date(2023, 5, 9), <>Adjusted Faeline Stomp in APL</>, Tenooki),
  change(date(2023, 5, 3), <>Updated Serenity/Non-Serenity APls, cooldown/ability tracking improvements</>, Tenooki),
  change(date(2023, 5, 3), <>Fixes to cooldown tracking on various abilities</>, Tenooki),
  change(date(2023, 5, 2), <>Fixed a bug in WW reports with Chi Wave talented</>, Tenooki),
  change(date(2023, 2, 13), <>Initial APL Added</>, Durpn),
  change(date(2022, 1, 15), <>Clean up Changelog and Include <SpellLink spell={talents.INNER_PEACE_TALENT} /> to the Energycap</>, Hursti),
  change(date(2022, 1, 14), <>Initial Update for Dragonflight</>, Durpn),
];
