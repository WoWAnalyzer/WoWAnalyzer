import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/druid/restoration/CombatLogParser';
import { TALENTS_DRUID } from 'common/TALENTS';
import { CooldownBar } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';

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
      <Section title="Core Rotation">
        <BuildersSubsection modules={modules} events={events} info={info} />
        <SpendersSubsection modules={modules} events={events} info={info} />
      </Section>
      <Section title="Cooldowns">
        <p>TODO COOLDOWN USAGE DESCRIPTION</p>
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
      </Section>
    </>
  );
}

function BuildersSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasLi = info.combatant.hasTalent(TALENTS_DRUID.LUNAR_INSPIRATION_FERAL_TALENT);
  const hasDcr = info.combatant.hasTalent(TALENTS_DRUID.DOUBLE_CLAWED_RAKE_FERAL_TALENT);
  // const hasBt = info.combatant.hasTalent(TALENTS_DRUID.BLOODTALONS_FERAL_TALENT);
  return (
    <SubSection title="Builders">
      <p>
        Generate combo points with your builder abilites. With your{' '}
        <strong>current talent build</strong>, your priorities are:
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
                8 targets due to <SpellLink id={TALENTS_DRUID.DOUBLE_CLAWED_RAKE_FERAL_TALENT.id} />
              </>
            ) : (
              '4 targets'
            )}
            ) TODO UPDATE NUMBER WHEN SIMS AVAILABLE
          </li>
          {hasLi && (
            <li>
              Maintain <SpellLink id={SPELLS.MOONFIRE_FERAL.id} /> (on up to 4 targets) TODO UPDATE
              NUMBER WHEN SIMS AVAILABLE
            </li>
          )}
          <li>
            Fill with <SpellLink id={SPELLS.SWIPE_CAT.id} />
          </li>
        </ul>
      </p>
      TODO ORGANIZE THIS BETTER AND PROVIDE MORE TEXT / CONTEXT - EXPLANATION OF BT AND SNAPSHOTTING
      {modules.rakeUptime.subStatistic()}
      {hasLi && modules.moonfireUptime.subStatistic()}
      TODO SOMETHING FOR SHRED AND SWIPE?
    </SubSection>
  );
}

function SpendersSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasPw = info.combatant.hasTalent(TALENTS_DRUID.PRIMAL_WRATH_FERAL_TALENT);
  const hasApc = info.combatant.hasTalent(TALENTS_DRUID.APEX_PREDATORS_CRAVING_FERAL_TALENT);
  return (
    <SubSection title="Spenders">
      <p>
        Spend combo points with finisher abilites. With your <strong>current talent build</strong>,
        your priorities are:
        <br />
        <strong>Single-Target:</strong>
        <br />
        <ul>
          {hasApc && (
            <li>
              Consume <SpellLink id={TALENTS_DRUID.APEX_PREDATORS_CRAVING_FERAL_TALENT.id} /> proc
              (not a true spender because it's free)
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
              <SpellLink id={TALENTS_DRUID.PRIMAL_WRATH_FERAL_TALENT.id} />
            </li>
          ) : (
            <li>
              Maintain <SpellLink id={SPELLS.RIP.id} /> on as many targets as possible (for real AoE
              you should spec <SpellLink id={TALENTS_DRUID.PRIMAL_WRATH_FERAL_TALENT.id} />)
            </li>
          )}
          <li>
            Fill with <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> - always consume max energy! TODO
            LOGIC WITH RAMPANT FEROCITY??
          </li>
        </ul>
      </p>
      TODO ORGANIZE THIS BETTER AND PROVIDE MORE TEXT / CONTEXT - EXPLANATION OF BT AND SNAPSHOTTING
      {modules.ripUptime.subStatistic()}
      TODO SOMETHING FOR FEROCIOUS BITE?
    </SubSection>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasBerserk = info.combatant.hasTalent(TALENTS_DRUID.BERSERK_FERAL_TALENT);
  const hasIncarn = info.combatant.hasTalent(
    TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_FERAL_TALENT,
  );
  const hasConvoke = info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_FERAL_TALENT);
  const hasFeralFrenzy = info.combatant.hasTalent(TALENTS_DRUID.FERAL_FRENZY_FERAL_TALENT);
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
            spellId={TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_FERAL_TALENT.id}
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
            spellId={TALENTS_DRUID.FERAL_FRENZY_FERAL_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
    </SubSection>
  );
}
