import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import SHARED_CHANGELOG from 'analysis/retail/rogue/shared/CHANGELOG';

export default [
  change(date(2023, 2, 3), <>Fix some bugs related to log ordering/latency with <SpellLink id={SPELLS.ENVENOM} />.</>, ToppleTheNun),
  change(date(2023, 1, 28), 'Fix reference to Fury in Guide.', ToppleTheNun),
  change(date(2023, 1, 28), <>Update <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> to check duration of <SpellLink id={SPELLS.GARROTE} /> and <SpellLink id={SPELLS.RUPTURE} />.</>, ToppleTheNun),
  change(date(2023, 1, 28), <>Add breakdown of <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> usage to Guide.</>, ToppleTheNun),
  change(date(2023, 1, 28), <>Add details for <SpellLink id={TALENTS.THISTLE_TEA_TALENT} /> usage to Guide.</>, ToppleTheNun),
  change(date(2023, 1, 27), <>Fix max duration calculation for <SpellLink id={SPELLS.RUPTURE} /> not respecting Animacharged.</>, ToppleTheNun),
  change(date(2023, 1, 27), <>Add snapshotting information for <SpellLink id={SPELLS.GARROTE} /> and improve <SpellLink id={TALENTS.IMPROVED_GARROTE_TALENT} /> stealth detection.</>, ToppleTheNun),
  change(date(2023, 1, 27), <>Fix Animacharged not working for <SpellLink id={SPELLS.ENVENOM} />.</>, ToppleTheNun),
  change(date(2023, 1, 26), 'Fix finisher cast breakdowns showing as bad casts if finisher was Animacharged.', ToppleTheNun),
  change(date(2023, 1, 26), 'Add support for Animacharged CPs and low CP finishers in opener.', ToppleTheNun),
  change(date(2023, 1, 24), 'Update for Dragonflight.', ToppleTheNun),
  ...SHARED_CHANGELOG,
];
