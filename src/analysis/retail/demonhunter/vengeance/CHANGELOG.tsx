import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/demonhunter';
import { AGONIZING_FLAMES_VENGEANCE_TALENT } from 'common/TALENTS/demonhunter';
import { emallson, ToppleTheNun, xepheris } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2022, 9, 7), 'Begin working on support for Dragonflight.', ToppleTheNun),
  change(date(2022, 8, 12), <>Add support for <SpellLink id={SPELLS.FODDER_TO_THE_FLAME_DAMAGE.id} />.</>, ToppleTheNun),
  change(date(2022, 7, 24), <>Correct <SpellLink id={SPELLS.SINFUL_BRAND.id} /> cooldown.</>, ToppleTheNun),
  change(date(2022, 4, 7), <>Added several conduits and updated <SpellLink id={AGONIZING_FLAMES_VENGEANCE_TALENT.id} /> implementation.</>, xepheris),
  change(date(2022, 4, 7), <>Added Average <SpellLink id={SPELLS.BLIND_FAITH_BUFF.id} /> versatility buff stat tracking.</>, xepheris),
  change(date(2022, 3, 26), 'Fix crash related to Unity legendary support.', emallson),
];
