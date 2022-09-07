import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/demonhunter';
import { ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2022, 9, 7), 'Begin working on support for Dragonflight.', ToppleTheNun),
  change(date(2022, 8, 12), <>Add support for <SpellLink id={SPELLS.FODDER_TO_THE_FLAME_DAMAGE.id} />.</>, ToppleTheNun),
  change(date(2022, 7, 25), <>Add tracker for <SpellLink id={SPELLS.FURIOUS_GAZE.id} />.</>, ToppleTheNun),
  change(date(2022, 7, 24), 'Remove talents that were removed in BFA/Shadowlands prepatch.', ToppleTheNun),
  change(date(2022, 7, 24), <>Correct <SpellLink id={SPELLS.SINFUL_BRAND.id} /> cooldown.</>, ToppleTheNun),
  change(date(2022, 7, 24), <>Correct spelling of <SpellLink id={SPELLS.FEL_DEVASTATION_DAMAGE.id} />.</>, ToppleTheNun),
  change(date(2022, 7, 14), <>Add <SpellLink id={SPELLS.SINFUL_BRAND.id} /> uptime tracking and change <SpellLink id={SPELLS.SINFUL_BRAND.id} /> cast recommendation.</>, ToppleTheNun),
];
