import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import { GuideProps, Section, SubSection, useAnalyzer } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts, { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';

import { RageWindowCounter } from '../abilities/DragonRage';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { formatDurationMinSec } from 'common/format';

export function DragonRageSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const rageWindows = Object.values(modules.dragonRage.rageWindowCounters);
  const castEffic = useAnalyzer(CastEfficiency)?.getCastEfficiencyForSpellId(
    TALENTS_EVOKER.DRAGONRAGE_TALENT.id,
  );

  return (
    <Section title="Dragon Rage">
      <p>
        <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} /> is your primary cooldown and
        contributes a large portion of your DPS. Because this window gives us our mastery{' '}
        <SpellLink id={SPELLS.GIANT_SLAYER_MASTERY.id} /> with{' '}
        <SpellLink id={TALENTS_EVOKER.TYRANNY_TALENT} /> and gauranteed{' '}
        <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT} /> procs, we need to utilize the talent{' '}
        <SpellLink id={TALENTS_EVOKER.ANIMOSITY_TALENT.id} /> to extend the buff duration as long as
        possible. We do this by trying to get in more than 2 rounds of{' '}
        <SpellLink id={TALENTS_EVOKER.ETERNITY_SURGE_TALENT.id} /> and{' '}
        <SpellLink id={SPELLS.FIRE_BREATH.id} /> by making the most of these talents:{' '}
        <SpellLink id={TALENTS_EVOKER.CAUSALITY_TALENT} />,
        <SpellLink id={TALENTS_EVOKER.FEED_THE_FLAMES_TALENT.id} />, and{' '}
        <SpellLink id={TALENTS_EVOKER.TIP_THE_SCALES_TALENT} />.
      </p>
      <p>
        To maximize the amount of <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT} /> procs you
        get in <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} /> you should only be casting{' '}
        <SpellLink id={SPELLS.AZURE_STRIKE.id} /> or <SpellLink id={SPELLS.LIVING_FLAME_CAST} /> if{' '}
        <SpellLink id={TALENTS_EVOKER.BURNOUT_TALENT.id} /> is talented and up.
      </p>

      <SubSection title="Current Limits">
        <p>
          You can gaurantee <strong>at least 2 casts</strong> of{' '}
          <SpellLink id={SPELLS.FIRE_BREATH.id} /> and{' '}
          <SpellLink id={TALENTS_EVOKER.ETERNITY_SURGE_TALENT.id} /> by holding them if{' '}
          <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} /> is coming up in 10~15s (check out
          the rotation above). But reaching more than that requires lust, haste, and RNG. To
          understand this better checkout the{' '}
          <a href="https://www.wowhead.com/guide/classes/evoker/devastation/rotation-cooldowns-pve-dps#maximizing-dragonrage">
            Maximizing Dragonrage
          </a>{' '}
          section on wowhead.
        </p>
        {info.combatant.hasTalent(TALENTS_EVOKER.EVERBURNING_FLAME_TALENT) && (
          <p>
            Since you have <SpellLink id={TALENTS_EVOKER.EVERBURNING_FLAME_TALENT.id} /> over{' '}
            <SpellLink id={TALENTS_EVOKER.FEED_THE_FLAMES_TALENT.id} /> it could be harder to reach
            4 empowered spells in a DR window.
          </p>
        )}
      </SubSection>
      {rageWindows.map((window, index) => {
        const relevantEvents = events
          .filter(isApplicableEvent(info?.playerId ?? 0))
          .filter(
            (event) =>
              event.timestamp &&
              event.timestamp >= window.start &&
              event.timestamp <= window.end &&
              event.type === 'cast',
          );

        if (relevantEvents.length === 0) {
          return null;
        }

        return (
          <SubSection
            key={index}
            title={`Dragon Rage Window ${index + 1} out of ${
              castEffic?.maxCasts
            } (${formatDurationMinSec((window.end - window.start) / 1000)})`}
          >
            <ExplanationAndDataSubSection
              explanationPercent={30}
              explanation={
                <Statistics
                  window={window}
                  hasFeedTheFlames={info.combatant.hasTalent(TALENTS_EVOKER.FEED_THE_FLAMES_TALENT)}
                />
              }
              data={
                <div style={{ overflowX: 'auto' }}>
                  <EmbeddedTimelineContainer
                    secondWidth={60}
                    secondsShown={(window.end - window.start) / 1000}
                  >
                    <SpellTimeline>
                      <Casts
                        start={relevantEvents[0].timestamp}
                        movement={undefined}
                        secondWidth={60}
                        events={relevantEvents}
                      />
                    </SpellTimeline>
                  </EmbeddedTimelineContainer>
                </div>
              }
            />
          </SubSection>
        );
      })}
    </Section>
  );
}

// Need something prettier lol
function Statistics({
  window,
  hasFeedTheFlames,
}: {
  window: RageWindowCounter;
  hasFeedTheFlames?: boolean;
}) {
  return (
    <ul>
      <li>
        <SpellLink id={SPELLS.FIRE_BREATH.id} /> - {window.fireBreaths}/{hasFeedTheFlames ? 2 : 1}{' '}
        casts
      </li>
      <li>
        <SpellLink id={SPELLS.ETERNITY_SURGE.id} /> - {window.eternitySurges}/2 casts
      </li>
      <li>
        <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT.id} /> - {window.essenceBursts} casts
      </li>
      <li>
        <SpellLink id={SPELLS.DISINTEGRATE.id} /> - {window.disintegrateTicks} ticks
      </li>
      <li>
        <SpellLink id={TALENTS_EVOKER.PYRE_TALENT.id} /> - {window.pyres} casts
      </li>
    </ul>
  );
}
