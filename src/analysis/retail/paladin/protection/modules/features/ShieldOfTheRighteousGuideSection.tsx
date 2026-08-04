import type { JSX } from 'react';
import { abilityToSpell } from 'common/abilityToSpell';
import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { BadColor, GoodColor, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import DamageTakenPointChart, {
  TrackedHit,
} from 'interface/guide/components/DamageTakenPointChart';
import Explanation from 'interface/guide/components/Explanation';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import { Highlight } from 'interface/Highlight';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

import ShieldOfTheRighteous from './ShieldOfTheRighteous';

function HitTooltipContent({ hit }: { hit: TrackedHit }) {
  const info = useInfo()!;
  const damage = hit.event.amount + (hit.event.absorbed || 0);
  return (
    <div>
      <div>
        <strong>Time:</strong> {formatDuration(hit.event.timestamp - info.fightStart)}
      </div>
      <div>
        You took <strong>{formatNumber(damage)}</strong> from{' '}
        <SpellLink spell={abilityToSpell(hit.event.ability)}>{hit.event.ability.name}</SpellLink>.
      </div>
    </div>
  );
}

export default function ShieldOfTheRighteousSection(): JSX.Element | null {
  const info = useInfo();
  const sotr = useAnalyzer(ShieldOfTheRighteous);

  if (!info || !sotr) {
    return null;
  }

  const uptimeBar = uptimeBarSubStatistic(
    { start_time: info.fightStart, end_time: info.fightEnd },
    {
      spells: [SPELLS.SHIELD_OF_THE_RIGHTEOUS],
      uptimes: sotr.uptime,
      color: GoodColor,
    },
  );

  return (
    <SubSection title="Shield of the Righteous">
      <ExplanationRow>
        <Explanation>
          <p>
            <strong>
              <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> is your primary active
              mitigation.
            </strong>
          </p>
          <p>
            It substantially increases your armor, reducing most incoming physical damage. Unlike
            stacking buffs it extends its own duration instead, so casting it again while it is up
            is not wasted &mdash; but the duration is capped, so banking too much is.{' '}
            <strong>
              Aim to have <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> active for every
              physical hit you take while tanking.
            </strong>
          </p>
          <p>
            The chart shows your uptime alongside the physical hits you took. Hits taken without{' '}
            <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> (shown in{' '}
            <Highlight color={BadColor}>red</Highlight>) are the ones that hurt.
          </p>
        </Explanation>
        <div>
          <strong>
            Shield of the Righteous Uptime &mdash; you mitigated {sotr.sotrHits} / {sotr.totalHits}{' '}
            hits
          </strong>
          {uptimeBar}
          <strong>Damage Taken</strong>{' '}
          <small>
            - Hits without <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> are shown in{' '}
            <Highlight color={BadColor} textColor="white">
              red
            </Highlight>
            , covered hits in{' '}
            <Highlight color={GoodColor} textColor="white">
              green
            </Highlight>
          </small>
          <DamageTakenPointChart hits={sotr.hits} tooltip={HitTooltipContent} />
        </div>
      </ExplanationRow>
    </SubSection>
  );
}
