import { change, date } from 'common/changelog';
import { jazminite, Melnais, Bhahlou } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/classic/warlock';

export default [
  change(date(2024, 7, 15), <>Now supports prepull <SpellLink spell={SPELLS.METAMORPHOSIS} /> and <SpellLink spell={SPELLS.DEMON_SOUL_FELGUARD_BUFF} /> in cooldown section.</>, Bhahlou),
  change(date(2024, 7, 6), 'Add Always Be Casting module.', jazminite),
  change(date(2024, 7, 3), 'Add foundation guide for Cata Classic Warlock Demonology spec.', jazminite),
  change(date(2023, 8, 4), 'Add Decimation to timeline', Melnais),
  change(date(2023, 7, 6), 'Add Guide Procs subsection + set guide to default view.', jazminite),
  change(date(2023, 6, 9), 'Add Guide Cooldowns Graph subsection.', jazminite),
  change(date(2023, 5, 7), 'Updates to Guide Core section + added Spells subsection.', jazminite),
  change(date(2023, 4, 23), 'Started Guide and added Core and Preparation sections.', jazminite),
  change(date(2023, 4, 2), 'Remove static entries for Healthstone use in favor of HealthstoneChecker.', jazminite),
  change(date(2022, 2, 24), 'Add Molten Core buff to timeline + GCD reduction. Track Shadow Mastery debuff uptime.', jazminite),
  change(date(2022, 12, 30), 'Add trinkets to Buffs for timeline highlight.', jazminite),
  change(date(2022, 11, 21), 'Update example report and set partial to false.', jazminite),
  change(date(2022, 11, 21), 'Add first draft of Classic Demonology Warlock spec.', jazminite),
];
