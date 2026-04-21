import { change, date } from 'common/changelog';
import { Bigsxy, Topple, Whispyr, SebShady, emallson, Vollmer, Chiso } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import SHARED_CHANGELOG from 'analysis/retail/rogue/shared/CHANGELOG';

// prettier-ignore
export default [
  change(date(2025, 4, 9), 'Spells adjusted and partial support for 12.0.0', Chiso),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2024, 11, 18), 'Remove Sepsis and adjust other spells updated in 11.0.5', emallson),
  change(date(2024, 9, 22), 'TWW initial compatibility update.', SebShady),
  change(date(2024, 5, 22), 'Fix spelling of Ravenholdt.', Topple),
  change(date(2023, 12, 10), <>Add experimental <SpellLink spell={TALENTS.KINGSBANE_TALENT} /> support behind a toggle.</>, Topple),
  change(date(2023, 12, 10), <>Mark as partially updated for 10.2 and add note about <SpellLink spell={TALENTS.KINGSBANE_TALENT} /> analysis coming soon.</>, Topple),
  change(date(2023, 12, 10), <>Add analysis for <SpellLink spell={SPELLS.MUTILATE} /> during <SpellLink spell={SPELLS.BLINDSIDE_BUFF} />, <SpellLink spell={SPELLS.SHADOW_DANCE_BUFF} />, <SpellLink spell={SPELLS.SUBTERFUGE_BUFF} />, and <SpellLink spell={SPELLS.VANISH_BUFF} />.</>, Topple),
  change(date(2023, 11, 22), <>Update analysis for <SpellLink spell={SPELLS.ENVENOM} /> and general finisher usage.</>, Topple),
  change(date(2023, 8, 24), `Improved support for Sepsis with Coooldown breakdown + Snapshoting`, [Bigsxy, Whispyr]),
  change(date(2023, 8, 21), 'Add support for usage of Sepsis with Improved Garrote.', Bigsxy),
  change(date(2023, 8, 7), 'Mark Assassination as supported for 10.1.5.', Topple),
  change(date(2023, 7, 8), 'Update SpellLink usage.', Topple),
  change(date(2023, 3, 21), 'Bump to 10.0.7.', Topple),
  change(date(2023, 3, 19), 'Add "Hide Good Casts" toggle to Core Rotation and Cooldown sections of the Guide.', Topple),
  change(date(2023, 2, 3), <>Fix some bugs related to log ordering/latency with <SpellLink spell={SPELLS.ENVENOM} />.</>, Topple),
  change(date(2023, 1, 28), 'Fix reference to Fury in Guide.', Topple),
  change(date(2023, 1, 28), <>Update Exsanuinate to check duration of <SpellLink spell={SPELLS.GARROTE} /> and <SpellLink spell={SPELLS.RUPTURE} />.</>, Topple),
  change(date(2023, 1, 28), <>Add breakdown of Exsanguinate usage to Guide.</>, Topple),
  change(date(2023, 1, 28), <>Add details for <SpellLink spell={TALENTS.THISTLE_TEA_TALENT} /> usage to Guide.</>, Topple),
  change(date(2023, 1, 27), <>Fix max duration calculation for <SpellLink spell={SPELLS.RUPTURE} /> not respecting Animacharged.</>, Topple),
  change(date(2023, 1, 27), <>Add snapshotting information for <SpellLink spell={SPELLS.GARROTE} /> and improve <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} /> stealth detection.</>, Topple),
  change(date(2023, 1, 27), <>Fix Animacharged not working for <SpellLink spell={SPELLS.ENVENOM} />.</>, Topple),
  change(date(2023, 1, 26), 'Fix finisher cast breakdowns showing as bad casts if finisher was Animacharged.', Topple),
  change(date(2023, 1, 26), 'Add support for Animacharged CPs and low CP finishers in opener.', Topple),
  change(date(2023, 1, 24), 'Update for Dragonflight.', Topple),
  ...SHARED_CHANGELOG,
];
