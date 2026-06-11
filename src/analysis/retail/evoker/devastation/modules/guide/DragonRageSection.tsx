import { SpellLink, TooltipElement } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS/evoker';
import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';

import { DragonRageWindowSection } from './DragonRageWindows';
import { TIERS } from 'game/TIERS';
import { EVOKER_MID1_ID } from 'common/ITEMS';
import ItemSetLink from 'interface/ItemSetLink';

export function DragonRageSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const rageWindows = Object.values(modules.dragonRage.rageWindowCounters);

  if (rageWindows.length === 0) return null;

  const hasIridescence = info.combatant.hasTalent(TALENTS_EVOKER.IRIDESCENCE_TALENT);
  const hasMID1TierSet = info.combatant.has2PieceByTier(TIERS.MID1);

  return (
    <Section title="Dragonrage">
      <p>
        <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} /> is your primary cooldown and
        contributes to a large portion of your DPS. Because this window gives us our mastery{' '}
        <SpellLink spell={SPELLS.GIANT_SLAYER_MASTERY} /> with{' '}
        <SpellLink spell={TALENTS_EVOKER.TYRANNY_TALENT} /> and guaranteed{' '}
        <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> procs, we need to utilize the talent{' '}
        <SpellLink spell={TALENTS_EVOKER.ANIMOSITY_TALENT} /> to extend the buff duration as long as
        possible. We do this by casting <strong>at least</strong> 4{' '}
        <TooltipElement
          content={
            <>
              <SpellLink spell={TALENTS_EVOKER.ETERNITY_SURGE_TALENT} /> and{' '}
              <SpellLink spell={SPELLS.FIRE_BREATH} />
            </>
          }
        >
          Empowers
        </TooltipElement>
        , by making the most of the talents: <SpellLink spell={TALENTS_EVOKER.CAUSALITY_TALENT} />{' '}
        and <SpellLink spell={TALENTS_EVOKER.TIP_THE_SCALES_TALENT} />.
      </p>
      <p>
        To generate <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> procs inside of{' '}
        <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} /> you should be casting{' '}
        <SpellLink spell={SPELLS.LIVING_FLAME_CAST} /> with{' '}
        <SpellLink spell={SPELLS.BURNOUT_BUFF} /> or{' '}
        <SpellLink spell={SPELLS.LEAPING_FLAMES_BUFF} /> active. Use{' '}
        <SpellLink spell={SPELLS.AZURE_STRIKE} /> as a fallback filler.
      </p>
      {hasMID1TierSet && (
        <p>
          When playing with the{' '}
          <strong>
            <ItemSetLink id={EVOKER_MID1_ID}>MID Season 1 Tier Set</ItemSetLink>
          </strong>{' '}
          <SpellLink spell={SPELLS.AZURE_SWEEP} /> should be prioritized over{' '}
          <SpellLink spell={SPELLS.LIVING_FLAME_CAST} />.
        </p>
      )}
      {hasIridescence && (
        <p>
          When playing with{' '}
          <strong>
            <SpellLink spell={TALENTS_EVOKER.IRIDESCENCE_TALENT} />
          </strong>{' '}
          you should avoid using <SpellLink spell={SPELLS.AZURE_STRIKE} /> with{' '}
          <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} /> active.
        </p>
      )}

      <DragonRageWindowSection rageWindows={rageWindows} events={events} info={info} />
    </Section>
  );
}
