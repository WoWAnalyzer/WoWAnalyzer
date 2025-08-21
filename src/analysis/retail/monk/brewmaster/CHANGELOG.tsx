import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { emallson, Vetyst } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2025, 8, 21), <>Update priority of <SpellLink spell={talents.KEG_SMASH_TALENT} /> in breathless builds.</>, emallson),
  change(date(2025, 8, 17), <>Support <SpellLink spell={talents.CELESTIAL_INFUSION_TALENT} /> in <SpellLink spell={talents.ASPECT_OF_HARMONY_TALENT} /> analysis. Minor rotation updates.</>, emallson),
  change(date(2025, 8, 9), <>Add basic support for <SpellLink spell={talents.CELESTIAL_INFUSION_TALENT} /> and the revamped <SpellLink spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /></>, emallson),
  change(date(2025, 7, 12), <>Fix Purifying Brew section when literally no Purifies are used.</>, emallson),
  change(date(2025, 6, 8), <>Add preparation section to overview.</>, Vetyst),
  change(date(2025, 5, 3), <>Add guide section for Master of Harmony.</>, emallson),
  change(date(2025, 4, 30), 'Fix crash in new Shado-Pan section.', emallson),
  change(date(2025, 4, 30), <>Add guide section for Shado-Pan.</>, emallson),
  change(date(2025, 4, 26), <>Update <SpellLink spell={talents.CHI_BURST_SHARED_TALENT} /> position in the APL as Master of Harmony.</>, emallson),
  change(date(2025, 4, 11), <>Add some rules to the APL to better handle real-world play.</>, emallson),
  change(date(2025, 3, 10), <>Update APL for Undermine, simplify <SpellLink spell={talents.FACE_PALM_TALENT} /> tracking.</>, emallson),
  change(date(2025, 3, 1), <>Added support for the Undermine tier set, <SpellLink spell={talents.EFFICIENT_TRAINING_TALENT} />, and updated <SpellLink spell={SPELLS.PURIFIED_CHI} /> stack tracking.</>, emallson),
  change(date(2024, 11, 20), <>Updated text for <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> section (again).</>, emallson),
  change(date(2024, 10, 13), <>Updated text for <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> section.</>, emallson),
  change(date(2024, 8, 31), <>Updated <SpellLink spell={talents.ANVIL__STAVE_TALENT} /> implementation to better fit TWW behavior.</>, emallson),
  change(date(2024, 8, 31), <>Added <SpellLink spell={talents.ENDLESS_DRAUGHT_TALENT} /> support</>, emallson),
  change(date(2024, 8, 31), <>Added basic <SpellLink spell={talents.MANTRA_OF_PURITY_TALENT} /> support</>, emallson),
  change(date(2024, 8, 31), 'Updated rotation section for TWW', emallson),
  change(date(2024, 7, 6), 'Post-Dragonflight cleanup. Re-enabled Brewmaster', emallson),
];
