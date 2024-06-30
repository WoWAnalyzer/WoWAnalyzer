import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { SubSection, useAnalyzer, useInfo } from '../index';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';
import Explanation from '../components/Explanation';
import { TooltipElement } from 'interface/Tooltip';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import { FoundationHighlight as HL } from './shared';
import { ByRole, Role } from './ByRole';

export function FoundationDowntimeSection(): JSX.Element | null {
  const alwaysBeCasting = useAnalyzer(AlwaysBeCasting);
  const cancelledCasts = useAnalyzer(CancelledCasts);
  const info = useInfo();
  if (!alwaysBeCasting) {
    return null;
  }

  return (
    <SubSection title="Always Be Casting">
      <Explanation>
        <p>
          The foundation of good play in <em>World of Warcraft</em> is having low downtime. The
          first step is to <strong>Always Be Casting</strong>.{' '}
          <HL>
            <ByRole>
              <Role.Melee>
                There should be no gaps between the end of one <GCD /> and the start of the next.
              </Role.Melee>
              <Role.Caster>
                There should be no gaps between the end of one spell cast and the start of the next.
              </Role.Caster>
            </ByRole>
          </HL>{' '}
          It is better to use the wrong spell and keep going than it is to stop and think between
          each cast&mdash;using nothing does no damage or healing, but using anything (even if it
          isn't the <em>best</em> choice) will at least do <em>something.</em>
        </p>
        <p>
          With practice, you can keep active <em>and</em> pick the right spells for each moment, but
          remember that <strong>doing something is better than doing nothing</strong>.
        </p>
      </Explanation>

      <p>
        Active Time:{' '}
        <PerformanceStrong performance={alwaysBeCasting.DowntimePerformance}>
          {formatPercentage(alwaysBeCasting.activeTimePercentage, 1)}%
        </PerformanceStrong>{' '}
        <ByRole>
          <Role.Caster>
            Cancelled Casts:{' '}
            {cancelledCasts /* need to check this because the parameters are evaluated even for melee */ && (
              <PerformanceStrong performance={cancelledCasts.CancelledPerformance}>
                {formatPercentage(cancelledCasts.cancelledPercentage, 1)}%
              </PerformanceStrong>
            )}
          </Role.Caster>
        </ByRole>
      </p>
      <p>
        <ActiveTimeGraph
          activeTimeSegments={alwaysBeCasting.activeTimeSegments}
          fightStart={info!.fightStart}
          fightEnd={info!.fightEnd}
        />
      </p>
      <p>
        As a general guideline,{' '}
        <HL>
          you should have <strong>80%+</strong> active time during normal phases of a boss fight.
        </HL>{' '}
        Exceptional players will often hit <em>nearly 100%</em> during these periods.
      </p>
    </SubSection>
  );
}

const GCD = () => (
  <TooltipElement
    content={
      <>
        Most abilities share a <em>Global Cooldown</em> of <strong>1.5s</strong>, reduced by Haste.
        Specs using energy usually have a fixed <strong>1s</strong> GCD instead.
      </>
    }
  >
    GCD
  </TooltipElement>
);
