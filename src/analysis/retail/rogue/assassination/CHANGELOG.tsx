import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';

export default [
  change(date(2023, 1, 27), <>Fix max duration calculation for <SpellLink id={SPELLS.RUPTURE} /> not respecting Animacharged.</>, ToppleTheNun),
  change(date(2023, 1, 27), <>Add snapshotting information for <SpellLink id={SPELLS.GARROTE} /> and improve <SpellLink id={TALENTS.IMPROVED_GARROTE_TALENT} /> stealth detection.</>, ToppleTheNun),
  change(date(2023, 1, 27), <>Fix Animacharged not working for <SpellLink id={SPELLS.ENVENOM} />.</>, ToppleTheNun),
  change(date(2023, 1, 26), 'Fix finisher cast breakdowns showing as bad casts if finisher was Animacharged.', ToppleTheNun),
  change(date(2023, 1, 26), 'Add support for Animacharged CPs and low CP finishers in opener.', ToppleTheNun),
  change(date(2023, 1, 24), 'Update for Dragonflight.', ToppleTheNun),
];
