import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior'
import { Abelito75, carglass, Carrottopp, Otthopsy, bandit, Toreole, emallson, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 7, 23), <>Normalize extra casts from <SpellLink spell={TALENTS.BLADEMASTERS_TORMENT_TALENT}/>.</>, ToppleTheNun),
  change(date(2023, 7, 8), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 1, 30), 'Fixed a crashing bug in the rage tracker.', emallson),
  change(date(2023, 1, 27), <>Updated Ability list for 10.0.5; Added Skullsplitter bleed damage contribution</>, Toreole),
  change(date(2023, 1, 26), <>Improved Execute rage refund calculation more reliable</>, Toreole),
  change(date(2023, 1, 18), <>Fixed Rage Tracking massively overestimating rage generation</>, Toreole),
  change(date(2023, 1, 17), <>WIP updating Arms Warrior for Dragonflight 10.0.5</>, Toreole),
  change(date(2022, 2, 26), <>Change Arms Warrior patch compatibility to 9.2</>, Carrottopp),
  change(date(2022, 2, 26), <>Added more abilites into rotational cooldown tracker.</>, Carrottopp),
  change(date(2022, 2, 7), <>Updated <SpellLink spell={TALENTS.REND_ARMS_TALENT} icon /> and <SpellLink spell={SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF} icon /> dot refresh modules.</>, Carrottopp),
  change(date(2022, 2, 5), <>Added a module for better suggestions of <SpellLink spell={SPELLS.BLADESTORM} icon /> usage.</>, Carrottopp),
  change(date(2021, 11, 8), <>Fixed SpellLink issue for Signet Of Tormented Kings.</>, Abelito75),
  change(date(2021, 10, 29), <>Initial Arms APL added. (Still WIP)</>, bandit),
  change(date(2021, 10, 10), <>Fixed <SpellLink spell={SPELLS.OVERPOWER} icon /> cooldown resets with Tactician</>, bandit),
  change(date(2021, 10, 7), <>adjusted gcds and added seasoned veteran passive</>, bandit),
  change(date(2021, 8, 10), <>reworked Dot Uptime Statistic Box</>, carglass),
  change(date(2021, 6, 22), <>Support for Enduring Blow Legendary for Arms Warriors</>, carglass),
  change(date(2021, 6, 5), <>Support for Signet of Tormented Kings Legendary for Arms Warriors</>, carglass),
  change(date(2021, 1, 23), <>Updated the module tracking the use of <SpellLink spell={SPELLS.MORTAL_STRIKE} icon /> during execution phase.</>, Otthopsy),
  change(date(2021, 1, 13), <>Added a module to track the uptime of <SpellLink spell={SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF} icon /> during execution phase and if it was refreshed too early or too late.</>, Otthopsy),
  change(date(2021, 1, 10),  <>Update execute range tracker for Condemn on targets above 80% health</>, Carrottopp),
  change(date(2020, 12, 26), <>Added Spear of Bastion, Conquerors Banner, and Ancient Aftershock to cooldowns section.</>, Carrottopp),
  change(date(2020, 12, 25), <>Add covenant abilites to statistics.</>, Carrottopp),
  change(date(2020, 12, 17), <>Added some shadowlandisms.</>, Abelito75),
  change(date(2020, 12, 17), <>Removed all BFAisms.</>, Abelito75),
];
