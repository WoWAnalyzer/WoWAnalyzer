import { manu310891, Nevdok, nullDozzer } from 'CONTRIBUTORS';
import TALENTS from 'common/TALENTS/warrior';
import { change, date } from 'common/changelog';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2025, 1, 9), 'Add support for Colossus hero spec', Nevdok),
  change(date(2025, 1, 6), 'Update years-old Arms theorycrafting and APL logic', Nevdok),
  change(date(2024, 10, 14), <>Add <SpellLink spell={TALENTS.INTERVENE_TALENT} /> to spellbook. Cooldown adjustments when specced into <SpellLink spell={TALENTS.HONED_REFLEXES_TALENT} />.</>, nullDozzer),
  change(date(2024, 9, 18), 'Fix various rage bugs! Fix bladestorm not being tracked.', nullDozzer),
  change(date(2024, 9, 7), 'Greatly improved tracking of rage generation and sources of rage. Visualized by showing a graph of Rage in the Rage usage tab.', nullDozzer),
  change(date(2024, 8, 15),"Enabled spec, adjusted cooldowns and fixed skullsplitter talent", manu310891),
];
