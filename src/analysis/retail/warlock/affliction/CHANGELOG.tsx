import { change, date } from 'common/changelog';
import {Katorri} from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';

export default [
  change(date(2026, 5, 31), "Add Always Be Casting guide section; adjust DoT Uptimes guide section; add contextual tip to UA uptime section for cleave/AoE fights; register SiphonLife analyzer; remove outdated Darkglare dot extension tracking.", Katorri),
  change(date(2026, 4, 21), "Spec compatibility updated for 12.0.5", Katorri),
  change(date(2026, 3, 22), <>Created an analyzer for the cooldown reduction on <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> based on <SpellLink spell={TALENTS.CULL_THE_WEAK_TALENT} />.</>, Katorri),
  change(date(2026, 3, 20), "Add Demonic Healthstone Tracker.", Katorri),
  change(date(2026, 3, 9), <>Created new analyzers for <SpellLink spell={SPELLS.CORRUPTION_DEBUFF} /> / <SpellLink spell={TALENTS.WITHER_TALENT} />, <SpellLink spell={SPELLS.AGONY} />, and <SpellLink spell={TALENTS.HAUNT_TALENT} />. </>, Katorri),
  change(date(2026, 2, 21), "Initial Midnight update to activate Affliction", Katorri),
];
