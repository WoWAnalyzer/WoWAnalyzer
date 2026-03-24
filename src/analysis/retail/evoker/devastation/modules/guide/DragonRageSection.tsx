import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';

import { DragonRageWindowSection } from './DragonRageWindows';

export function DragonRageSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const rageWindows = Object.values(modules.dragonRage.rageWindowCounters);

  return (
    <Section title="Dragonrage">
      <p>
        <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} /> is your primary cooldown and
        contributes to a large portion of your DPS. Because this window gives us our mastery{' '}
        <SpellLink spell={SPELLS.GIANT_SLAYER_MASTERY} /> with{' '}
        <SpellLink spell={TALENTS_EVOKER.TYRANNY_TALENT} /> and guaranteed{' '}
        <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> procs, we need to utilize the talent{' '}
        <SpellLink spell={TALENTS_EVOKER.ANIMOSITY_TALENT} /> to extend the buff duration as long as
        possible. We do this by getting in 2 rounds of{' '}
        <SpellLink spell={TALENTS_EVOKER.ETERNITY_SURGE_TALENT} /> and{' '}
        <SpellLink spell={SPELLS.FIRE_BREATH} /> by making the most of the talents:{' '}
        <SpellLink spell={TALENTS_EVOKER.CAUSALITY_TALENT} /> and{' '}
        <SpellLink spell={TALENTS_EVOKER.TIP_THE_SCALES_TALENT} />.
      </p>
      <p>
        To generate <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> procs inside of{' '}
        <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} /> you should be casting{' '}
        <SpellLink spell={SPELLS.LIVING_FLAME_CAST} /> with{' '}
        <SpellLink spell={SPELLS.BURNOUT_BUFF} /> or <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> or{' '}
        <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} /> is active. Use{' '}
        <SpellLink spell={SPELLS.AZURE_STRIKE} /> as a fallback filler.
      </p>

      <DragonRageWindowSection rageWindows={rageWindows} events={events} info={info} />
    </Section>
  );
}
