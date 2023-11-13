import styled from '@emotion/styled';
import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { AlertWarning, ControlledExpandable, SpellLink, Tooltip } from 'interface';
import { GuideProps, Section, SectionHeader, SubSection } from 'interface/guide';
import {
  CooldownExpandableDataList,
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import PassFailBar from 'interface/guide/components/PassFailBar';
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
  [talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id]: talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
};

const MAX_STOMPS = {
  [talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id]: 5,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: 3,
};

const TARGET_PURIFIES = {
  [talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id]: 6,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: 4,
};

export type CommonProps = { cast: NiuzaoCastData; info: Info; events: AnyEvent[] };

function NiuzaoChecklistHeader({ cast, info }: Pick<CommonProps, 'cast' | 'info'>): JSX.Element {
  return (
    <>
      {formatDuration(cast.startEvent.timestamp - info.fightStart)} &mdash;{' '}
      <SpellLink spell={NIUZAO_BUFF_ID_TO_CAST[cast.startEvent.ability.guid]} /> (
      {formatNumber(cast.stompDamage)})
    </>
  );
}

const PassFailCheckmark = ({ pass }: { pass: boolean }) =>
  pass ? (
    <i className="glyphicon glyphicon-ok" style={{ color: color.purify }} />
  ) : (
    <i className="glyphicon glyphicon-remove" style={{ color: 'red' }} />
  );

const GUESS_MAX_HP = 1_000_000;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
`;

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

  const detailItems: CooldownExpandableItem[] = [
    {
      label: (
        <>
          <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} /> casts
        </>
      ),
      result: (
        <>
          {cast.stomps.length} / {MAX_STOMPS[cast.startEvent.ability.guid]}
        </>
      ),
      details: (
        <>
          <PassFailBar pass={cast.stomps.length} total={MAX_STOMPS[cast.startEvent.ability.guid]} />
        </>
      ),
    },
    {
      label: (
        <>
          Possible <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> Casts
        </>
      ),
      result: (
        <>
          {formatNumber(cast.purifies.length)} / {TARGET_PURIFIES[cast.startEvent.ability.guid]}
        </>
      ),
      details: (
        <td>
          <PassFailBar
            pass={cast.purifies.length}
            total={TARGET_PURIFIES[cast.startEvent.ability.guid]}
          />
        </td>
      ),
    },
    {
      label: (
        <>
          Total <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} /> damage
        </>
      ),
      result: formatNumber(cast.stompDamage),
    },

    {
      label: <>Amount Purified</>,
      result: formatNumber(cast.purifyStompContribution),
    },
    {
      label: <>Amount Pre-Purified</>,
      result: formatNumber(cast.prePurified.reduce((total, { amount }) => total + amount, 0)),
    },
  ];

  const checklistItems: CooldownExpandableItem[] = [
    {
      label: 'Purified Before Casting',
      result: <PassFailCheckmark pass={cast.prePurified.length > 0} />,
    },
    {
      label: (
        <>
          Started with 1+ <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> Charge
        </>
      ),
      result: <PassFailCheckmark pass={cast.purifyingAtCast.charges >= 1} />,
      details: (
        <>
          ({cast.purifyingAtCast.charges} charges
          {cast.purifyingAtCast.charges < 2 && (
            <>, {(cast.purifyingAtCast.cooldown / 1000).toFixed(1)}s til next</>
          )}
          )
        </>
      ),
    },
    {
      label: <>Was Actively Tanking</>,
      result: <PassFailCheckmark pass={wasActivelyTanking} />,
      details: (
        <>
          (
          {formatNumber(
            cast.relevantHits.reduce(
              (total, { amount, unmitigatedAmount }) => total + (unmitigatedAmount ?? amount),
              0,
            ),
          )}{' '}
          damage taken){' '}
          <Tooltip
            content={
              <>
                This number shows pre-mitigation, pre-
                <SpellLink spell={SPELLS.STAGGER} /> damage.
              </>
            }
          >
            <InformationIcon />
          </Tooltip>
        </>
      ),
    },
    {
      label: (
        <>
          Used <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> to Buff{' '}
          <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} />
        </>
      ),
      result: <PassFailCheckmark pass={wasActivelyTanking && purifiedEnough} />,
      details: (
        <>
          ({formatNumber(cast.purifyStompContribution)} damage Purified){' '}
          <Tooltip
            hoverable
            content={
              <>
                This is the full amount of purified damage that contributed to any{' '}
                <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} />. Niuzao takes 25% of this amount as
                the base bonus damage, which may then be increased by effects like{' '}
                <SpellLink spell={talents.WALK_WITH_THE_OX_TALENT} />. Purified damage that expired
                before the next <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} /> is not counted.
              </>
            }
          >
            <span>
              <InformationIcon />
            </span>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <ControlledExpandable
      header={
        <SectionHeader>
          <NiuzaoChecklistHeader cast={cast} info={info} />
        </SectionHeader>
      }
      element="section"
      expanded={isExpanded}
      inverseExpanded={() => setIsExpanded(!isExpanded)}
    >
      {cast.sitDetected && (
        <p>
          <AlertWarning>
            This cast of <SpellLink spell={NIUZAO_BUFF_ID_TO_CAST[cast.startEvent.ability.guid]} />{' '}
            appears to have used <code>/sit</code> to inflate damage taken. This is a risky strat
            and should only be done with the approval of your raid group.
          </AlertWarning>
        </p>
      )}
      <TwoColumn>
        <div>
          <CooldownExpandableDataList title="Checklist" items={checklistItems} />
          <CooldownExpandableDataList title="Details" items={detailItems} />
        </div>
        <InvokeNiuzaoSummaryChart cast={cast} info={info} events={events} />
      </TwoColumn>
    </ControlledExpandable>
  );
}

const EfficiencyTable = styled.table`
  & td {
    padding: 0 0.5em;
  }
  & td:first-child {
    padding-left: 0;
  }
`;

export function ImprovedInvokeNiuzaoSection({
  castEfficiency,
  events,
  info,
  module,
}: Pick<GuideProps<any>, 'events' | 'info'> & {
  castEfficiency: CastEfficiency;
  module: InvokeNiuzao;
}): JSX.Element | null {
  if (!info.combatant.hasTalent(talents.IMPROVED_INVOKE_NIUZAO_THE_BLACK_OX_TALENT)) {
    // this section is explicitly for the improved Invoke Niuzao
    return null;
  }

  const shouldCheckWoo = info.combatant.hasTalent(talents.CALL_TO_ARMS_TALENT);

  const efficiency = castEfficiency.getCastEfficiencyForSpellId(
    talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id,
  );

  const wooEfficiency = castEfficiency.getCastEfficiencyForSpellId(
    talents.WEAPONS_OF_ORDER_TALENT.id,
  );

  return (
    <Section title="Invoke Niuzao, the Black Ox">
      <p>
        With the <SpellLink spell={talents.IMPROVED_INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> talent,{' '}
        <SpellLink spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> becomes one of the most
        powerful damage cooldowns in the game&mdash;and one of the most dangerous. Using this
        ability, we can efficiently turn massive amounts of damage taken into massive amounts of
        damage dealt.
      </p>
      <p>
        This talent
        <SpellLink spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> to add 25% of the purified
        damage to the next <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} /> within 6 seconds. Niuzao
        casts <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} /> when he is summoned, and then every 5
        seconds after that, for a total of 5
        <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} />s per{' '}
        <SpellLink spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} />.
        {shouldCheckWoo && (
          <>
            {' '}
            A cast of <SpellLink spell={talents.WEAPONS_OF_ORDER_TALENT} /> (with{' '}
            <SpellLink spell={talents.CALL_TO_ARMS_TALENT} />) will trigger 3{' '}
            <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} />
            s&mdash;though this Niuzao has some issues hitting bosses with large models.
          </>
        )}{' '}
        Casting <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> prior to summoning Niuzao will
        contribute to the damage of the first <SpellLink spell={SPELLS.NIUZAO_STOMP_DAMAGE} />.
      </p>
      <p>
        Unlike most damage cooldowns, it is frequently correct to sacrifice a cast of{' '}
        <SpellLink spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> in order to get a better
        cast later. This is because <em>so much</em> of the damage of this cooldown is tied up in
        using <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> to convert damage taken into
        damage dealt that a single <em>great</em> cast can be worth more than multiple mediocre
        casts.
      </p>
      <EfficiencyTable>
        <tbody>
          {efficiency && (
            <tr>
              <td>
                <SpellLink spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> casts
              </td>

              <td className="pass-fail-counts">
                {efficiency.casts} / {efficiency.maxCasts}{' '}
              </td>
              <td>
                <PassFailBar pass={efficiency.casts} total={efficiency.maxCasts} />
              </td>
            </tr>
          )}
          {wooEfficiency && (
            <tr>
              <td>
                <SpellLink spell={talents.WEAPONS_OF_ORDER_TALENT} /> casts
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
      </EfficiencyTable>
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
