import { change, date } from 'common/changelog';
import { Vetyst, Khazak, Brandrewsss, Arlie, HerzBlutRaffy } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';

export default [
  change(date(2026, 2, 1), <>
    Major Midnight (12.0.0) update:
    <ul>
      <li>Re-enabled analyzer with patch 12.0.0 compatibility</li>
      <li>Updated all spell IDs for Midnight (Dark Transformation, Scourge Strike, Army of the Dead, etc.)</li>
      <li>Added Putrefy and Pestilence tracking</li>
      <li>Added Dread Plague tracking</li>
      <li>Updated Soul Reaper with execution phase logic (35% threshold)</li>
      <li>Updated Sudden Doom to reflect Dread Plague proc mechanic</li>
      <li>Updated Summon Gargoyle with new Lesser Ghoul Putrefy mechanics</li>
      <li>Removed deprecated Festering Wound tracking (replaced by Lesser Ghouls)</li>
      <li>Removed Clawing Shadows as castable ability (now passive AoE talent)</li>
      <li>Added Lesser Ghoul summoning and tracking</li>
      <li>Added Midnight Season 1 Tier Set spell IDs</li>
      <li>Added Hero Talent tree detection (Rider, San'layn, Deathbringer)</li>
      <li>Cleaned up deprecated analyzers and modules</li>
    </ul>
  </>, HerzBlutRaffy),
  change(date(2025, 10, 13), <>Updated cooldown and CDR of <SpellLink spell={TALENTS.ANTI_MAGIC_ZONE_TALENT} />.</>, Arlie),
  change(date(2025, 10, 13), 'Added a Cooldown section to the Guide', Brandrewsss),
  change(date(2025, 10, 12), 'Updated Unholy Death Knight Analyzer to Guide layout and updated folder structure', Brandrewsss),
  change(date(2025, 6, 23), 'Update Unholy Death Knight Buffs for Patch 11.1.5', Brandrewsss),
  change(date(2025, 6, 8), 'Update Unholy Death Knight Abilities and Talents for Patch 11.1.5', Brandrewsss),
  change(date(2024, 12, 9), 'Update spec config to reflect lack of long term maintainers', Khazak),
  change(date(2024, 10, 7), <>Correct GCD and cooldown of <SpellLink spell={SPELLS.ANTI_MAGIC_SHELL.id} /> when paired with <SpellLink spell={TALENTS.ANTI_MAGIC_BARRIER_TALENT.id} /> and <SpellLink spell={TALENTS.UNYIELDING_WILL_TALENT.id} />.</>, Vetyst),
  change(date(2024, 10, 4), 'Enable Core Foundation of Unholy DK for TWW.', Vetyst),
];
