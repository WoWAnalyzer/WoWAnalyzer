import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/druid/feral/CombatLogParser';
import { TALENTS_DRUID } from 'common/TALENTS';
import { CooldownBar } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS';
import { SpellLink, TooltipElement } from 'interface';
import { directAoeBuilder } from 'analysis/retail/druid/feral/constants';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Resource Use">
        <SubSection title="Energy">
          <p>
            Feral's primary resource is Energy. Typically, ability use will be limited by energy,
            not time. You should avoid capping energy - lost energy regeneration is lost DPS. It
            will occasionally be impossible to avoid capping energy - like while handling mecahnics
            or during intermission phases.
          </p>
          TODO ENERGY GRAPH w/ HIGHLIGHTED CAPPED ENERGY, TIMES OFF TARGET (NO MELEE)
        </SubSection>
        <SubSection title="Combo Points">
          <p>
            Feral uses a system of Combo Point builders and spenders. Spenders are always more
            powerful than builders - when you reach maximum combo points you should always use a
            spender.
          </p>
          TODO LIST OF BUILDERS w/ GENERATED vs WASTED (OVERCAP)
          <br />
          TODO LIST OF SPENDERS w/ LOW CP USAGE
        </SubSection>
      </Section>
      <CoreRotationSection modules={modules} events={events} info={info} />
      <Section title="Cooldowns">
        <p>TODO COOLDOWN USAGE DESCRIPTION</p>
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
      </Section>
    </>
  );
}

function CoreRotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasLi = info.combatant.hasTalent(TALENTS_DRUID.LUNAR_INSPIRATION_TALENT);
  const hasBrs = info.combatant.hasTalent(TALENTS_DRUID.BRUTAL_SLASH_TALENT);
  const hasDcr = info.combatant.hasTalent(TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT);
  const hasBt = info.combatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT);
  const hasPw = info.combatant.hasTalent(TALENTS_DRUID.PRIMAL_WRATH_TALENT);
  const hasApc = info.combatant.hasTalent(TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT);
  const hasPc = info.combatant.hasTalent(TALENTS_DRUID.PRIMAL_CLAWS_TALENT);
  const hasAdaptiveSwarm = info.combatant.hasTalent(TALENTS_DRUID.ADAPTIVE_SWARM_TALENT);

  return (
    <Section title="Core Rotation">
      <p>
        Feral's core rotation is performing <strong>builder</strong> abilites up to 5 combo points,
        then using a <strong>spender</strong> ability. You will have priority lists for each
        category:
      </p>
      <SubSection>
        <strong>Builders</strong> generate combo points. Due to{' '}
        <SpellLink id={TALENTS_DRUID.PRIMAL_FURY_TALENT.id} />{' '}
        {hasPc && (
          <>
            {' '}
            and <SpellLink id={TALENTS_DRUID.PRIMAL_CLAWS_TALENT.id} />
          </>
        )}
        , it will take a variable number of abilities to reach 5 CPs - pay attention to how many
        you've generated!
        <br />
        With your <strong>current talent build</strong>, your priorities are:
        <br />
        <strong>Single-Target:</strong>
        <br />
        <ul>
          <li>
            Maintain <SpellLink id={SPELLS.RAKE.id} />
          </li>
          {hasLi && (
            <li>
              Maintain <SpellLink id={SPELLS.MOONFIRE_FERAL.id} />
            </li>
          )}
          {hasBrs && (
            <li>
              Use <SpellLink id={TALENTS_DRUID.BRUTAL_SLASH_TALENT.id} />
            </li>
          )}
          <li>
            Fill with <SpellLink id={SPELLS.SHRED.id} />
          </li>
        </ul>
        <strong>Multi-Target:</strong>
        <br />
        <ul>
          <li>
            Maintain <SpellLink id={SPELLS.THRASH_FERAL.id} />
          </li>
          <li>
            Maintain <SpellLink id={SPELLS.RAKE.id} /> (on up to{' '}
            {hasDcr ? (
              <>
                8 targets due to <SpellLink id={TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT.id} />
              </>
            ) : (
              '4 targets'
            )}
            )
          </li>
          {hasLi && (
            <li>
              Maintain <SpellLink id={SPELLS.MOONFIRE_FERAL.id} /> (on up to 4 targets)
            </li>
          )}
          <li>
            Fill with <SpellLink id={directAoeBuilder(info.combatant).id} />
          </li>
          {hasBrs && (
            <li>
              Fill with <SpellLink id={SPELLS.SHRED.id} /> if out of Brutal Slash charges
            </li>
          )}
        </ul>
        {hasBt && (
          <>
            <strong>
              Due to <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} />
            </strong>
            , you may use a sub-optimal builder in order to get a proc - the difference will be more
            than made up for by the damage boost to your spenders.
          </>
        )}
      </SubSection>
      <SubSection>
        <strong>Spenders</strong> cost combo points. With the exception of applying your initial{' '}
        <SpellLink id={SPELLS.RIP.id} />, always wait until max CPs to use - with your{' '}
        <strong>current talent build</strong>, your priorities are:
        <br />
        <strong>Single-Target:</strong>
        <br />
        <ul>
          {hasApc && (
            <li>
              Consume <SpellLink id={TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT.id} /> proc (not a
              true spender because it's free)
            </li>
          )}
          <li>
            Maintain <SpellLink id={SPELLS.RIP.id} />
          </li>
          <li>
            Fill with <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> - always consume max energy!
          </li>
        </ul>
        <strong>Multi-Target:</strong>
        <br />
        <ul>
          {hasPw ? (
            <li>
              Maintain <SpellLink id={SPELLS.RIP.id} /> with{' '}
              <SpellLink id={TALENTS_DRUID.PRIMAL_WRATH_TALENT.id} />
            </li>
          ) : (
            <li>
              Maintain <SpellLink id={SPELLS.RIP.id} /> on as many targets as possible (for real AoE
              you should spec <SpellLink id={TALENTS_DRUID.PRIMAL_WRATH_TALENT.id} />)
            </li>
          )}
          <li>
            Fill with <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> - always consume max energy! TODO
            LOGIC WITH RAMPANT FEROCITY??
          </li>
        </ul>
      </SubSection>
      {modules.rakeUptime.guideSubsection}
      {hasLi && (
        <SubSection>
          <strong>
            <SpellLink id={SPELLS.MOONFIRE_FERAL.id} />
          </strong>{' '}
          - Maintain uptime, preferably with{' '}
          <TooltipElement content={snapshotTooltip()}>snapshots</TooltipElement>
          {modules.moonfireUptime.subStatistic()}
        </SubSection>
      )}
      <SubSection>
        <strong>
          <SpellLink id={SPELLS.SWIPE_CAT.id} /> and <SpellLink id={SPELLS.THRASH_FERAL.id} />
        </strong>{' '}
        - TODO targets hit eval (check for bloodtalons contrib)
      </SubSection>
      {modules.ripUptime.guideSubsection}
      <SubSection>
        <strong>
          <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />
        </strong>{' '}
        - TODO eval? Per-cast (snapshot, use full energy)
        <br />
        Apex predator usage?
      </SubSection>
      {hasAdaptiveSwarm && (
        <SubSection>
          <strong>
            <SpellLink id={TALENTS_DRUID.ADAPTIVE_SWARM_TALENT.id} />
          </strong>{' '}
          - ???
          {modules.adaptiveSwarm.subStatistic()}
        </SubSection>
      )}
    </Section>
  );
}

function snapshotTooltip() {
  return (
    <>
      Your damage over time abilities 'snapshot' some of your buffs, retaining their damage bonus
      over the DoTs full duration, even if the buff fades. The buffs that snapshot are{' '}
      <SpellLink id={TALENTS_DRUID.TIGERS_FURY_TALENT.id} />,{' '}
      <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} />, and{' '}
      <SpellLink id={TALENTS_DRUID.POUNCING_STRIKES_TALENT.id} />
    </>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasBerserk = info.combatant.hasTalent(TALENTS_DRUID.BERSERK_TALENT);
  const hasIncarn = info.combatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT);
  const hasConvoke = info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_SHARED_TALENT);
  const hasFeralFrenzy = info.combatant.hasTalent(TALENTS_DRUID.FERAL_FRENZY_TALENT);
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <div className="flex-main chart" style={{ padding: 5 }}>
        <CooldownBar spellId={SPELLS.TIGERS_FURY.id} events={events} info={info} highlightGaps />
      </div>
      {hasBerserk && !hasIncarn && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar spellId={SPELLS.BERSERK.id} events={events} info={info} highlightGaps />
        </div>
      )}
      {hasIncarn && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {hasConvoke && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={SPELLS.CONVOKE_SPIRITS.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {hasFeralFrenzy && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DRUID.FERAL_FRENZY_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
    </SubSection>
  );
}
