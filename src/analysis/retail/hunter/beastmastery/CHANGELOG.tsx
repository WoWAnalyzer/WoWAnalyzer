import { change, date } from 'common/changelog';
import { Putro, Arlie, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
export default [
  change(date(2023, 1, 20), <>Added handling for a large amount of hidden resets on <SpellLink id={TALENTS.KILL_COMMAND_SHARED_TALENT} /> and <SpellLink id={TALENTS.BARBED_SHOT_TALENT} /> to improve cast efficiency metrics.</>, Putro),
  change(date(2023, 1, 20), <>Separated <SpellLink id={SPELLS.DIRE_BEAST_BUFF}/> uptime attribution into <SpellLink id={TALENTS.DIRE_BEAST_TALENT} /> and <SpellLink id={TALENTS.DIRE_PACK_TALENT} />.</>, Putro),
  change(date(2023, 1, 20), <>Updated <SpellLink id={TALENTS.DIRE_BEAST_TALENT}/> base cooldown.</>, Putro),
  change(date(2022, 12, 16), 'Re-enable log parser.', ToppleTheNun),
  change(date(2022, 11, 11), 'Initial transition of Beast Mastery to Dragonflight', [Arlie, Putro]),
];
