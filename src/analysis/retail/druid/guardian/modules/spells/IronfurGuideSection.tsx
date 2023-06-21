import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import { Highlight } from 'interface/Highlight';
import DamageTakenPointChart, {
  TrackedHit,
} from 'interface/guide/components/DamageTakenPointChart';
import { BadColor, GoodColor, PerfectColor, Section, useAnalyzer, useInfo } from 'interface/guide';
import Ironfur, { IronfurTrackedHit } from 'analysis/retail/druid/guardian/modules/spells/Ironfur';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import { abilityToSpell } from 'common/abilityToSpell';

function HitTooltipContent({ hit }: { hit: TrackedHit }) {
  const info = useInfo()!;
  const damage = hit.event.amount + (hit.event.absorbed || 0);
  return (
    <div>
      <div>
        <strong>Time:</strong> {formatDuration(hit.event.timestamp - info.fightStart)}
      </div>
      <div>
        <strong>Ironfur Stacks:</strong> {(hit as IronfurTrackedHit).stacks}
      </div>
      <div>
        You took <strong>{formatNumber(damage)}</strong> from{' '}
        <SpellLink spell={abilityToSpell(hit.event.ability)}>{hit.event.ability.name}</SpellLink>.
      </div>
    </div>
  );
}

export default function IronfurSection(): JSX.Element {
  const info = useInfo()!;
  const ironfur = useAnalyzer(Ironfur)!;

  const uptimeBar = uptimeBarSubStatistic(
    { start_time: info.fightStart, end_time: info.fightEnd },
    {
      spells: [SPELLS.IRONFUR],
      uptimes: ironfur.uptime,
      color: GoodColor,
    },
  );

  return (
    <Section title="Ironfur">
      <ExplanationRow>
        <Explanation>
          <p>
            <strong>
              <SpellLink spell={SPELLS.IRONFUR} /> is Guardian's core defensive ability.
            </strong>
          </p>
          <p>
            It greatly increases your armor, which greatly reduces most incoming physical damage
            (like melee attacks).{' '}
            <strong>
              You should aim to always have at least one stack of{' '}
              <SpellLink spell={SPELLS.IRONFUR} /> while you are the active tank.
            </strong>
          </p>
          <p>
            This chart shows your <SpellLink spell={SPELLS.IRONFUR} /> uptime along with the
            physical hits you took. Melee hits taken without <SpellLink spell={SPELLS.IRONFUR} />{' '}
            (shown in <Highlight color={BadColor}>red</Highlight>) can be very dangerous!
          </p>
        </Explanation>
        <div>
          <strong>
            Ironfur Uptime - you mitigated {ironfur.coveredHits} / {ironfur.totalHits} hits
          </strong>
          {uptimeBar}
          <strong>Damage Taken</strong>{' '}
          <small>
            - Hits without Ironfur are shown in{' '}
            <Highlight color={BadColor} textColor="white">
              red
            </Highlight>
            , with 1 stack in{' '}
            <Highlight color={GoodColor} textColor="white">
              green
            </Highlight>
            , and with multiple stacks in{' '}
            <Highlight color={PerfectColor} textColor="white">
              blue
            </Highlight>
          </small>
          <DamageTakenPointChart hits={ironfur.hits} tooltip={HitTooltipContent} />
        </div>
      </ExplanationRow>
    </Section>
  );
}
