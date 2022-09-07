import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { AlertWarning, ControlledExpandable, SpellLink, Tooltip } from 'interface';
import { GuideProps, PassFailBar, Section, SectionHeader, SubSection } from 'interface/guide';
import InformationIcon from 'interface/icons/Information';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { useMemo, useState } from 'react';

import { color } from '../../charts';
import type { NiuzaoCastData } from './analyzer';
import { InvokeNiuzao } from './analyzer';
import { InvokeNiuzaoSummaryChart } from './chart';

export { InvokeNiuzao } from './analyzer';

const NIUZAO_BUFF_ID_TO_CAST = {
  [SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id]: SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
};

const MAX_STOMPS = {
  [SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id]: 5,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: 3,
};

const TARGET_PURIFIES = {
  [SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id]: 6,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: 4,
};

export type CommonProps = { cast: NiuzaoCastData; info: Info; events: AnyEvent[] };

function NiuzaoChecklistHeader({ cast, info }: Pick<CommonProps, 'cast' | 'info'>): JSX.Element {
  return (
    <SectionHeader>
      {formatDuration(cast.startEvent.timestamp - info.fightStart)} &mdash;{' '}
      <SpellLink id={NIUZAO_BUFF_ID_TO_CAST[cast.startEvent.ability.guid]} /> (
      {formatNumber(cast.stompDamage)})
    </SectionHeader>
  );
}

const PassFailCheckmark = ({ pass }: { pass: boolean }) =>
  pass ? (
    <i className="glyphicon glyphicon-ok" style={{ color: color.purify }} />
  ) : (
    <i className="glyphicon glyphicon-remove" style={{ color: 'red' }} />
  );

const GUESS_MAX_HP = 100000;

function InvokeNiuzaoChecklist({ events, cast, info }: CommonProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  const wasActivelyTanking = useMemo(
    () =>
      cast.relevantHits.reduce(
        (total, { unmitigatedAmount, amount, maxHitPoints }) =>
          total + (unmitigatedAmount ?? amount) / (maxHitPoints ?? GUESS_MAX_HP),
        0,
      ) >= 1 || cast.purifies.reduce((total, { amount }) => total + amount, 0) > GUESS_MAX_HP,
    [cast.purifies, cast.relevantHits],
  );

  const purifiedEnough = useMemo(() => {
    const hits = cast.relevantHits.map(({ maxHitPoints }) => maxHitPoints ?? GUESS_MAX_HP);

    let avg = hits.reduce((total, current) => total + current, 0) / hits.length;
    avg *=
      MAX_STOMPS[cast.startEvent.ability.guid] / Math.max.apply(null, Object.values(MAX_STOMPS));

    return cast.purifyStompContribution >= avg;
  }, [cast.purifyStompContribution, cast.relevantHits, cast.startEvent.ability.guid]);

  return (
    <ControlledExpandable
      header={<NiuzaoChecklistHeader cast={cast} info={info} />}
      element="section"
      expanded={isExpanded}
      inverseExpanded={() => setIsExpanded(!isExpanded)}
    >
      {cast.sitDetected && (
        <p>
          <AlertWarning>
            This cast of <SpellLink id={NIUZAO_BUFF_ID_TO_CAST[cast.startEvent.ability.guid]} />{' '}
            appears to have used <code>/sit</code> to inflate damage taken. This is a risky strat
            and should only be done with the approval of your raid group.
          </AlertWarning>
        </p>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr',
          gridColumnGap: '1em',
          alignItems: 'start',
        }}
      >
        <div>
          <section>
            <header style={{ fontWeight: 'bold' }}>Checklist</header>
            <table className="hits-list">
              <tbody>
                <tr>
                  <td>Purified Before Casting</td>
                  <td>
                    <PassFailCheckmark pass={cast.prePurified.length > 0} />
                  </td>
                </tr>
                <tr>
                  <td>
                    Started with 1+ <SpellLink id={SPELLS.PURIFYING_BREW.id} /> Charge
                  </td>
                  <td>
                    <PassFailCheckmark pass={cast.purifyingAtCast.charges >= 1} />
                  </td>
                  <td>
                    ({cast.purifyingAtCast.charges} charges
                    {cast.purifyingAtCast.charges < 2 && (
                      <>, {(cast.purifyingAtCast.cooldown / 1000).toFixed(1)}s til next</>
                    )}
                    )
                  </td>
                </tr>
                <tr>
                  <td>Was Actively Tanking</td>
                  <td>
                    <PassFailCheckmark pass={wasActivelyTanking} />
                  </td>
                  <td>
                    (
                    {formatNumber(
                      cast.relevantHits.reduce(
                        (total, { amount, unmitigatedAmount }) =>
                          total + (unmitigatedAmount ?? amount),
                        0,
                      ),
                    )}{' '}
                    pre-mitigation damage taken)
                  </td>
                </tr>
                <tr>
                  <td>
                    Used <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to Buff{' '}
                    <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />
                  </td>
                  <td>
                    <PassFailCheckmark pass={wasActivelyTanking && purifiedEnough} />
                  </td>
                  <td>
                    ({formatNumber(cast.purifyStompContribution)} damage Purified){' '}
                    <Tooltip
                      hoverable
                      content={
                        <>
                          This is the full amount of purified damage that contributed to any{' '}
                          <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />. Niuzao takes 25% of this
                          amount as the base bonus damage, which may then be increased by effects
                          like <SpellLink id={SPELLS.WALK_WITH_THE_OX.id} />. Purified damage that
                          expired before the next <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />{' '}
                          is not counted.
                        </>
                      }
                    >
                      <span>
                        <InformationIcon />
                      </span>
                    </Tooltip>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <section>
            <header style={{ fontWeight: 'bold' }}>Details</header>
            <table className="hits-list">
              <tbody>
                <tr>
                  <td>
                    <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} /> casts
                  </td>
                  <td className="pass-fail-counts">
                    {cast.stomps.length} / {MAX_STOMPS[cast.startEvent.ability.guid]}
                  </td>
                  <td>
                    <PassFailBar
                      pass={cast.stomps.length}
                      total={MAX_STOMPS[cast.startEvent.ability.guid]}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    Possible <SpellLink id={SPELLS.PURIFYING_BREW.id} /> Casts
                  </td>
                  <td className="pass-fail-counts">
                    {formatNumber(cast.purifies.length)} /{' '}
                    {TARGET_PURIFIES[cast.startEvent.ability.guid]}
                  </td>
                  <td>
                    <PassFailBar
                      pass={cast.purifies.length}
                      total={TARGET_PURIFIES[cast.startEvent.ability.guid]}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    Total <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} /> damage
                  </td>
                  <td className="pass-fail-counts">{formatNumber(cast.stompDamage)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Amount Purified</td>
                  <td className="pass-fail-counts">{formatNumber(cast.purifyStompContribution)}</td>
                </tr>
                <tr>
                  <td>Amount Pre-Purified</td>
                  <td className="pass-fail-counts">
                    {formatNumber(
                      cast.prePurified.reduce((total, { amount }) => total + amount, 0),
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
        {isExpanded && <InvokeNiuzaoSummaryChart cast={cast} info={info} events={events} />}
      </div>
    </ControlledExpandable>
  );
}

export function InvokeNiuzaoSection({
  castEfficiency,
  events,
  info,
  module,
}: Pick<GuideProps<any>, 'events' | 'info'> & {
  castEfficiency: CastEfficiency;
  module: InvokeNiuzao;
}): JSX.Element {
  const efficiency = castEfficiency.getCastEfficiencyForSpellId(
    SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id,
  )!;

  const wooEfficiency = castEfficiency.getCastEfficiencyForSpellId(
    SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
  );

  return (
    <Section title="Invoke Niuzao, the Black Ox">
      <p>
        <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> is one of the most powerful damage
        cooldowns in the game&mdash;and one of the most dangerous. Using this ability, we can
        efficiently turn massive amounts of damage taken into massive amounts of damage dealt.
      </p>
      <p>
        The level 58 upgrade to this ability causes <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to
        add 25% of the purified damage to the next <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />{' '}
        within 6 seconds. Niuzao casts <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} /> when he is
        summoned, and then every 5 seconds after that, for a total of 5
        <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />s per{' '}
        <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} />.
        {info.combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
          <>
            {' '}
            A cast of <SpellLink id={SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id} /> will trigger 3{' '}
            <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />
            s&mdash;though this Niuzao has some issues hitting bosses with large models.
          </>
        )}{' '}
        Casting <SpellLink id={SPELLS.PURIFYING_BREW.id} /> prior to summoning Niuzao will
        contribute to the damage of the first <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />.
      </p>
      <p>
        Unlike most damage cooldowns, it is frequently correct to sacrifice a cast of{' '}
        <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> in order to get a better cast later.
        This is because <em>so much</em> of the damage of this cooldown is tied up in using{' '}
        <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to convert damage taken into damage dealt that a
        single <em>great</em> cast can be worth more than multiple mediocre casts.
      </p>
      <table className="hits-list">
        <tbody>
          <tr>
            <td>
              <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> casts
            </td>

            <td className="pass-fail-counts">
              {efficiency.casts} / {efficiency.maxCasts}{' '}
            </td>
            <td>
              <PassFailBar pass={efficiency.casts} total={efficiency.maxCasts} />
            </td>
          </tr>
          {info.combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
            <tr>
              <td>
                <SpellLink id={SPELLS.WEAPONS_OF_ORDER_CAST.id} /> casts
              </td>
              <td className="pass-fail-counts">
                {wooEfficiency?.casts} / {wooEfficiency?.maxCasts}{' '}
              </td>
              <td>
                <PassFailBar pass={wooEfficiency!.casts} total={wooEfficiency!.maxCasts} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <SubSection title="Casts">
        {module.casts.some((cast) => cast.sitDetected) && (
          <p>
            <AlertWarning>
              One or more of the below casts appears to have used <code>/sit</code> to inflate
              damage taken. This is a risky strat and should only be done with the approval of your
              raid group.
            </AlertWarning>
          </p>
        )}
        {module.casts.map((cast, ix) => (
          <InvokeNiuzaoChecklist key={ix} cast={cast} info={info} events={events} />
        ))}
      </SubSection>
    </Section>
  );
}
