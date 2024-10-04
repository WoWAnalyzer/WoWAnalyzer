import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import { Sharrq, Zeboot, Meldris, ToppleTheNun, Jonfanz, Mae, dodse, Arlie, Putro, Zyer, Gazh} from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2024, 10, 1), <>Add support for <SpellLink spell={SPELLS.DEMONIC_HEALTHSTONE} /> </>, Gazh),
  change(date(2024, 9, 28), <>Add support for <SpellLink spell={TALENTS_WARLOCK.MARK_OF_FHARG_TALENT}/> & <SpellLink spell={TALENTS_WARLOCK.MARK_OF_SHATUG_TALENT}/></>, Gazh),
  change(date(2024, 9, 26), "Add support for Hero Talents", Gazh),
  change(date(2024, 5, 31), <>Fixed <SpellLink spell={TALENTS_WARLOCK.POWER_SIPHON_TALENT}/> statistic</>, Zyer),
  change(date(2024, 4, 30), "Updated for DF S4", Zyer),
  change(date(2024, 3, 6), <>Added <SpellLink spell={TALENTS_WARLOCK.DARK_PACT_TALENT}/> and <SpellLink spell={SPELLS.UNENDING_RESOLVE}/> guide</>, Zyer),
  change(date(2024, 2, 22), "Updated for patch 10.2.5, added statistic for T31 Amirdrassil", Zyer),
  change(date(2024, 2, 20), <>Added <SpellLink spell={TALENTS_WARLOCK.SUMMON_DEMONIC_TYRANT_TALENT}/> breakdown to main guide</>, Zyer),
  change(date(2024, 2, 6), <>Fixed Tyrant Statistic</>, Zyer),
  change(date(2024, 1, 6), <>Fix a crash related to <SpellLink spell={TALENTS_WARLOCK.GRIMOIRE_FELGUARD_TALENT} />.</>, Putro),
  change(date(2023, 7, 31), <>Add support for Aberrus 2set CDR on <SpellLink spell={TALENTS_WARLOCK.GRIMOIRE_FELGUARD_TALENT} /></>, Arlie),
  change(date(2023, 7, 31), 'Update CDR on Dark Pact and Unending Resolve', Arlie),
  change(date(2023, 7, 8), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 7, 8), "Removed Demonic Circle use tracker in utility and defensive spells", Meldris),
  change(date(2023, 6, 29), "Updated ABOUT with current guide links", Meldris),
  change(date(2023, 3, 9), "Update Soul Conduit to take into account being a 2 rank talent and different scaling", dodse),
  change(date(2023, 1, 4), "Add support for Shadow's Bite and Dread Calling talents", Mae),
  change(date(2022, 12, 29), 'Add support for Fel Covenant and 4 piece set bonus', Mae),
  change(date(2022, 12, 15), 'Fix crash caused by no Power Siphon casts being present in a log.', ToppleTheNun),
  change(date(2022, 10, 18), 'Update spec for Dragonflight', Jonfanz),
  change(date(2022, 7, 22), <>Add tracker for number of <SpellLink spell={SPELLS.DEMONIC_CIRCLE_SUMMON} /> created.</>, ToppleTheNun),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 15), 'Updated Spellbook and added Conduit, Legendary, and Covenant Spell IDs', Sharrq),
  change(date(2020, 10, 2), 'Deleted Azerite Traits, Updated Statistic Boxes and added Integration Tests.', Sharrq),
];
