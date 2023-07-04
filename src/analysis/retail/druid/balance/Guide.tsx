import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/druid/balance/CombatLogParser';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS';
import { formatPercentage } from 'common/format';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
      <CooldownsSection modules={modules} events={events} info={info} />
    </>
  );
}

function CoreSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core">
      <SubSection title="Always be Casting">
        <p>
          <em>
            <b>
              Continuously chaining casts throughout an encounter is the single most important thing
              for achieving good DPS as a caster.
            </b>
          </em>
          <br />
          There should be no delay at all between your spell casts, it's better to start casting the
          wrong spell than to think for a few seconds and then cast the right spell. You should be
          able to handle a fight's mechanics with the minimum possible interruption to your casting.
          Some fights have unavoidable downtime due to phase transitions and the like, so in these
          cases 0% downtime will not be possible - do the best you can.
        </p>
        Active Time:{' '}
        <strong>{formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%</strong>
        <br />
        TODO ACTIVE TIME GRAPH
      </SubSection>
      <SubSection title="Astral Power">
        <p>
          Your primary resource is Astral Power. Most of your spells generate Astral Power, and then
          it can be spent to cast <SpellLink spell={TALENTS_DRUID.STARSURGE_SHARED_TALENT} /> or{' '}
          <SpellLink spell={TALENTS_DRUID.STARFALL_TALENT} />. Avoid capping Astral Power!
        </p>
        The chart below shows your Astral Power over the course of the encounter. TODO show percent
        wasted.
        {modules.astralPowerGraph.plot}
      </SubSection>
    </Section>
  );
}

function RotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rotation">
      <SubSection>
        <strong>
          <SpellLink spell={TALENTS_DRUID.ECLIPSE_TALENT} />
        </strong>{' '}
        - TODO
      </SubSection>
      <SubSection>TODO - SPENDER USE</SubSection>
      {modules.dotUptimes.guideSubsection}
      <SubSection>
        TODO - Add Guide explanation for waning twilight and it's importance
        {modules.waningTwilight.guideSubsection}
        TODO - TALENT STUFF - talents w/ gameplay impact: Starweaver, Rattle the Stars, Waning
        Twilight (kinda), Wild Mushroom, New Moon, ...?
      </SubSection>
    </Section>
  );
}

function CooldownsSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <p>
        Balance's cooldowns are moderately powerful and as with most DPS specs they should not be
        held for long. In order to maximize usages over the course of an encounter, aim to send the
        cooldown as soon as it becomes available (as long as you can be active on target over its
        duration).
      </p>
      <CooldownGraphSubsection modules={modules} events={events} info={info} />
      <CooldownBreakdownSubsection modules={modules} events={events} info={info} />
    </Section>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      {info.combatant.hasTalent(TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT) &&
        !info.combatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT) && (
          <CastEfficiencyBar
            spellId={SPELLS.CELESTIAL_ALIGNMENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
      {info.combatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT) && (
        <CastEfficiencyBar
          spellId={SPELLS.INCARNATION_CHOSEN_OF_ELUNE.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
        <CastEfficiencyBar
          spellId={SPELLS.CONVOKE_SPIRITS.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.FURY_OF_ELUNE_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.FURY_OF_ELUNE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.ASTRAL_COMMUNION_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.ASTRAL_COMMUNION_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}

function CooldownBreakdownSubsection({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>) {
  return <SubSection>TODO - COOLDOWN BREAKDOWNS</SubSection>;
}
