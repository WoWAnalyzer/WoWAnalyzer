import colorForPerformance from 'common/colorForPerformance';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { BadColor, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import { Info } from 'parser/core/metric';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import Shuffle from './index';
import * as MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import { MAGIC_STAGGER_EFFECTIVENESS } from '../../../constants';
import DamageTakenPointChart, {
  TrackedHit,
} from 'interface/guide/components/DamageTakenPointChart';
import { Highlight } from 'interface/Highlight';

function HitTooltipContent({ hit }: { hit: TrackedHit }) {
  const info = useInfo()!;

  const isMagic = hit.event.ability.type !== MAGIC_SCHOOLS.default.ids.PHYSICAL;

  // Stagger absorb is 170-180% as strong with Shuffle up within the range of
  // reasonable Agility values. This works out to 60-70% "damage reduction"
  const modifier = isMagic ? MAGIC_STAGGER_EFFECTIVENESS : 1;
  const lowEndPct = 0.6 * modifier;
  const highEndPct = 0.7 * modifier;

  return (
    <div>
      <div>
        <strong>Time:</strong> {formatDuration(hit.event.timestamp - info.fightStart)}
      </div>
      <div>
        You took <strong>{formatNumber(hit.event.amount)}</strong> from{' '}
        <SpellLink id={hit.event.ability.guid}>{hit.event.ability.name}</SpellLink>.
      </div>
      {!hit.mitigated && (
        <div>
          <SpellLink id={SPELLS.SHUFFLE} /> would have reduced this by{' '}
          <strong>
            {formatPercentage(lowEndPct, 0)}&ndash;{formatPercentage(highEndPct, 0)}%
          </strong>{' '}
          (to {formatNumber((1 - highEndPct) * hit.event.amount)}&ndash;
          {formatNumber((1 - lowEndPct) * hit.event.amount)}) by increasing the amount absorbed by{' '}
          <SpellLink id={SPELLS.STAGGER} />.
        </div>
      )}
    </div>
  );
}

function ShuffleOverview({ shuffle, info }: { shuffle: Shuffle; info: Info }): JSX.Element {
  const uptime = uptimeBarSubStatistic(
    { start_time: info.fightStart, end_time: info.fightEnd },
    {
      spells: [SPELLS.SHUFFLE],
      uptimes: shuffle.uptime,
      color: colorForPerformance(1),
    },
  );

  return (
    <div>
      <strong>Shuffle Uptime</strong>
      {uptime}
      <strong>Damage Taken</strong>{' '}
      <small>
        - Hits without Shuffle are shown in{' '}
        <Highlight color={BadColor} textColor="white">
          red
        </Highlight>
        .
      </small>
      <DamageTakenPointChart hits={shuffle.hits} tooltip={HitTooltipContent} />
    </div>
  );
}

export default function ShuffleSection(): JSX.Element {
  const info = useInfo()!;
  const shuffle = useAnalyzer(Shuffle)!;

  return (
    <SubSection title="Shuffle">
      <ExplanationRow>
        <Explanation>
          <p>
            <SpellLink id={SPELLS.SHUFFLE} /> nearly <strong>doubles</strong> the amount of damage
            that is absorbed by <SpellLink id={SPELLS.STAGGER} />, and is critical to have up while
            tanking. It is applied automatically by your core rotational abilities&mdash;so as long
            as you are doing your rotation, you should have <SpellLink id={SPELLS.SHUFFLE} />.
          </p>
          <p>
            This chart shows your <SpellLink id={SPELLS.SHUFFLE} /> uptime along with the damage
            that you took. <strong>You do not need 100% uptime!</strong> However, damage taken
            without <SpellLink id={SPELLS.SHUFFLE} /> active (shown in{' '}
            <Highlight color={BadColor}>red</Highlight>) is very dangerous!
          </p>
        </Explanation>
        <ShuffleOverview info={info} shuffle={shuffle} />
      </ExplanationRow>
    </SubSection>
  );
}
