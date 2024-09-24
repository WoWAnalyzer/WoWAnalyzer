import { change, date } from 'common/changelog';
import { manu310891, nullDozzer } from 'CONTRIBUTORS';

export default [
  change(date(2024, 9, 25), <>Add <SpellLink spell={TALENTS.INTERVENE_TALENT} /> to spellbook. Cooldown adjustments when specced into <SpellLink spell={TALENTS.HONED_REFLEXES_TALENT} />.</>, nullDozzer),
  change(date(2024, 9, 18), 'Fix various rage bugs! Fix bladestorm not being tracked.', nullDozzer),
  change(date(2024, 9, 7), 'Greatly improved tracking of rage generation and sources of rage. Visualized by showing a graph of Rage in the Rage usage tab.', nullDozzer),
  change(date(2024, 8, 15),"Enabled spec, adjusted cooldowns and fixed skullsplitter talent", manu310891),
];
