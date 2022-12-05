import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import SHARED_CHANGELOG from 'analysis/retail/demonhunter/shared/CHANGELOG';

// prettier-ignore
export default [
  change(date(2022, 12, 5), 'Update Vengeance guide based on feedback from Fel Hammer.', ToppleTheNun),
  change(date(2022, 12, 4), 'Mark the Guide as the default view.', ToppleTheNun),
  change(date(2022, 12, 4), 'Remove recommended enchants.', ToppleTheNun),
  change(date(2022, 12, 4), <>Add <SpellLink id={SPELLS.SOUL_CLEAVE} /> and <SpellLink id={TALENTS.SPIRIT_BOMB_TALENT} /> per-cast breakdowns.</>, ToppleTheNun),
  change(date(2022, 12, 4), <>Hide <SpellLink id={TALENTS.SPIRIT_BOMB_TALENT} /> statistic when there are no casts of it. Remove <SpellLink id={TALENTS.SPIRIT_BOMB_TALENT} /> and <SpellLink id={SPELLS.SOUL_CLEAVE} /> defensive checklist items.</>, ToppleTheNun),
  change(date(2022, 11, 28), 'Remove gray backgrounds from most subsections in Guide.', ToppleTheNun),
  change(date(2022, 11, 27), 'Re-organize and internationalize Guide.', ToppleTheNun),
  change(date(2022, 11, 21), <>Fix degradation of <SpellLink id={TALENTS.THE_HUNT_TALENT} /> due to pre-casts.</>, ToppleTheNun),
  change(date(2022, 11, 20), <>Automatically minimize icons on cooldown graphs if any cooldown was cast 10 or more times.</>, ToppleTheNun),
  change(date(2022, 11, 20), <>Add per-cast breakdown for <SpellLink id={SPELLS.IMMOLATION_AURA} /> to the Guide.</>, ToppleTheNun),
  change(date(2022, 11, 20), <>Add cast efficiency for <SpellLink id={SPELLS.IMMOLATION_AURA} /> to the Guide.</>, ToppleTheNun),
  change(date(2022, 11, 15), <>Add per-cast breakdown for <SpellLink id={TALENTS.FEL_DEVASTATION_TALENT} /> to the Guide.</>, ToppleTheNun),
  change(date(2022, 11, 15), <>Add per-cast breakdown for <SpellLink id={TALENTS.SOUL_CARVER_TALENT} /> to the Guide.</>, ToppleTheNun),
  change(date(2022, 11, 15), <>Add per-cast breakdown for <SpellLink id={TALENTS.FRACTURE_TALENT} /> to the Guide.</>, ToppleTheNun),
  change(date(2022, 11, 15), <>Fix <SpellLink id={TALENTS.PAINBRINGER_TALENT} /> duration in statistic tooltip.</>, ToppleTheNun),
  change(date(2022, 11, 14), <>Add <SpellLink id={TALENTS.THE_HUNT_TALENT} /> cast breakdown to the Guide.</>, ToppleTheNun),
  change(date(2022, 11, 14), <>Add <SpellLink id={SPELLS.METAMORPHOSIS_TANK} /> support to the Guide.</>, ToppleTheNun),
  change(date(2022, 11, 10), 'Fix Throw Glaive tracking.', ToppleTheNun),
  change(date(2022, 11, 10), <>Prevent <SpellLink id={TALENTS.SIGIL_OF_MISERY_TALENT} /> and <SpellLink id={TALENTS.SIGIL_OF_SILENCE_TALENT} /> from appearing in statistics if untalented.</>, ToppleTheNun),
  change(date(2022, 11, 10), 'Mark as fully supported.', ToppleTheNun),
  change(date(2022, 11, 10), <>Remove Fury overcapping suggestions from <SpellLink id={TALENTS.DISRUPTING_FURY_TALENT} /> and <SpellLink id={TALENTS.SWALLOWED_ANGER_TALENT} />.</>, ToppleTheNun),
  change(date(2022, 11, 8), 'Move some spells to a shared spellbook.', ToppleTheNun),
  change(date(2022, 11, 1), <>Add <SpellLink id={SPELLS.FRAILTY} /> section to Guide.</>, ToppleTheNun),
  change(date(2022, 10, 31), 'Update talent-based statistics to show talent rank.', ToppleTheNun),
  change(date(2022, 10, 31), <>Remove misleading <SpellLink id={TALENTS.SIGIL_OF_FLAME_TALENT} /> statistic.</>, ToppleTheNun),
  change(date(2022, 10, 31), 'Mark Vengeance DH as partially supported for 10.0.0.', ToppleTheNun),
  change(date(2022, 10, 26), 'Enable guide for Vengeance DH.', ToppleTheNun),
  change(date(2022, 10, 22), 'Add Soul Fragment buff stack tracking to Guide.', ToppleTheNun),
  change(date(2022, 10, 22), 'Setup initial Vengeance DH guide.', ToppleTheNun),
  change(date(2022, 10, 22), <>Enable Soul Overcap analysis even when <SpellLink id={TALENTS.FEED_THE_DEMON_TALENT} /> is taken.</>, ToppleTheNun),
  change(date(2022, 10, 16), <>Add mitigation tracking for <SpellLink id={TALENTS.FIERY_BRAND_TALENT} />.</>, ToppleTheNun),
  change(date(2022, 10, 16), <>Add support for <SpellLink id={TALENTS.DISRUPTING_FURY_TALENT} />.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.FLAMES_OF_FURY_TALENT} />.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.STOKE_THE_FLAMES_TALENT} />.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Correct cooldown for <SpellLink id={TALENTS.FIERY_BRAND_TALENT} /> when <SpellLink id={TALENTS.DOWN_IN_FLAMES_TALENT} /> is talented.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.UNNATURAL_MALICE_TALENT} />.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Correct detection of <SpellLink id={TALENTS.ELYSIAN_DECREE_TALENT} /> damage.</>, ToppleTheNun),
  change(date(2022, 10, 15), <>Add support for <SpellLink id={TALENTS.SWALLOWED_ANGER_TALENT} />.</>, ToppleTheNun),
  change(date(2022, 10, 14), 'Correct some spell cooldowns and add missing spells.', ToppleTheNun),
  change(date(2022, 10, 13), 'Standardize Fury tracking across Havoc and Vengeance.', ToppleTheNun),
  change(date(2022, 10, 10), <>Improve detection of bad <SpellLink id={SPELLS.SHEAR} /> and <SpellLink id={TALENTS.FRACTURE_TALENT} /> casts.</>, ToppleTheNun),
  change(date(2022, 9, 22), 'Update to latest Havoc patch from 9/21/2022.', ToppleTheNun),
  change(date(2022, 9, 7), 'Begin working on support for Dragonflight.', ToppleTheNun),
  ...SHARED_CHANGELOG,
];
