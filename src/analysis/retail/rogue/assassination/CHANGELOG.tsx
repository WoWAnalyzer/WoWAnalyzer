import { change, date } from 'common/changelog';
import { ToppleTheNun, Bigsxy, Whispyr} from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import SHARED_CHANGELOG from 'analysis/retail/rogue/shared/CHANGELOG';

export default [
  change(date(2023, 8, 24), `Improved support for Sepsis with Coooldown breakdown + Snapshoting`, [Bigsxy,Whispyr]),
  change(date(2023, 8, 21), 'Add support for usage of Sepsis with Improved Garrote.', Bigsxy),
  change(date(2023, 8, 7), 'Mark Assassination as supported for 10.1.5.', ToppleTheNun),
  change(date(2023, 7, 8), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 3, 21), 'Bump to 10.0.7.', ToppleTheNun),
  change(date(2023, 3, 19), 'Add "Hide Good Casts" toggle to Core Rotation and Cooldown sections of the Guide.', ToppleTheNun),
  change(date(2023, 2, 3), <>Fix some bugs related to log ordering/latency with <SpellLink spell={SPELLS.ENVENOM} />.</>, ToppleTheNun),
  change(date(2023, 1, 28), 'Fix reference to Fury in Guide.', ToppleTheNun),
  change(date(2023, 1, 28), <>Update Exsanuinate to check duration of <SpellLink spell={SPELLS.GARROTE} /> and <SpellLink spell={SPELLS.RUPTURE} />.</>, ToppleTheNun),
  change(date(2023, 1, 28), <>Add breakdown of Exsanguinate usage to Guide.</>, ToppleTheNun),
  change(date(2023, 1, 28), <>Add details for <SpellLink spell={TALENTS.THISTLE_TEA_TALENT} /> usage to Guide.</>, ToppleTheNun),
  change(date(2023, 1, 27), <>Fix max duration calculation for <SpellLink spell={SPELLS.RUPTURE} /> not respecting Animacharged.</>, ToppleTheNun),
  change(date(2023, 1, 27), <>Add snapshotting information for <SpellLink spell={SPELLS.GARROTE} /> and improve <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} /> stealth detection.</>, ToppleTheNun),
  change(date(2023, 1, 27), <>Fix Animacharged not working for <SpellLink spell={SPELLS.ENVENOM} />.</>, ToppleTheNun),
  change(date(2023, 1, 26), 'Fix finisher cast breakdowns showing as bad casts if finisher was Animacharged.', ToppleTheNun),
  change(date(2023, 1, 26), 'Add support for Animacharged CPs and low CP finishers in opener.', ToppleTheNun),
  change(date(2023, 1, 24), 'Update for Dragonflight.', ToppleTheNun),
  ...SHARED_CHANGELOG,
];
