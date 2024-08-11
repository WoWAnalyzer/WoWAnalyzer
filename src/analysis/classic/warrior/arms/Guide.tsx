import { Section, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import Para from 'interface/guide/Para';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FoundationCooldownSection } from 'interface/guide/foundation/FoundationCooldownSection';
import { useExpansionContext } from 'interface/report/ExpansionContext';
import { FoundationHighlight as HL } from 'interface/guide/foundation/shared';
import Explanation from 'interface/guide/components/Explanation';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { TooltipElement } from 'interface/Tooltip';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';

export default function Guide(): JSX.Element {
  const { expansion } = useExpansionContext();
  return (
    <>
      <Section title="Core Skills">
        <ArmsDowntimeSection />
        <FoundationCooldownSection />
      </Section>
      <PreparationSection expansion={expansion} />
    </>
  );
}

function ArmsDowntimeSection() {
  const info = useInfo();
  const alwaysBeCasting = useAnalyzer(AlwaysBeCasting);

  if (!info || !alwaysBeCasting) {
    return null;
  }

  return (
    <SubSection title="Always Be Casting">
      <Explanation>
        <Para>
          The foundation of good play in <em>World of Warcraft</em> is having low downtime. The
          first step is to <strong>Always Be Casting</strong>. It is better to use the wrong spell
          and keep going than it is to stop and think between each cast&mdash;using nothing does no
          damage or healing, but using anything (even if it isn't the <em>best</em> choice) will at
          least do <em>something.</em>
        </Para>
        <Para>
          In Cataclysm, Arms Warrior does not have enough abilities or{' '}
          <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> to fill every GCD. This means that you will
          have lower{' '}
          <TooltipElement content={<>The percentage of time spent using spells and abilities.</>}>
            Active Time
          </TooltipElement>{' '}
          than other specs.
        </Para>
        <Para>
          With practice, you can keep active <em>and</em> pick the right spells for each moment, but
          remember that <strong>doing something is better than doing nothing</strong>.
        </Para>
      </Explanation>

      <Para>
        Active Time:{' '}
        <PerformanceStrong performance={alwaysBeCasting.DowntimePerformance}>
          {formatPercentage(alwaysBeCasting.activeTimePercentage, 1)}%
        </PerformanceStrong>{' '}
      </Para>
      <Para>
        <ActiveTimeGraph
          activeTimeSegments={alwaysBeCasting.activeTimeSegments}
          fightStart={info.fightStart}
          fightEnd={info.fightEnd}
        />
      </Para>
      <Para>
        As a general guideline,{' '}
        <HL>
          you should have <strong>70%+</strong> active time during normal phases of a boss fight.
        </HL>{' '}
        Exceptional players will often hit <em>nearly 100%</em> during these periods.
      </Para>
    </SubSection>
  );
}
