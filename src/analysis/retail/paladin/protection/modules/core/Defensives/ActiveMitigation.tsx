import { SubSection, useAnalyzers } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import { TIMELINE_ANALYZERS } from './config';

const ActiveMitigation = () => {
  const timelineAnalyzers = useAnalyzers(TIMELINE_ANALYZERS);
  return (
    <>
      <HideExplanationsToggle id="hide-explanations-active-defensives" />
      <SubSection>
        <Explanation>
          <p>WIP!</p>
          <p>
            Shield of the Righteous increase your armour by a significant amout and it's important
            to have it active while taking physical damage.
          </p>
          <p>
            Consecration, through your mastery, reduces the damage you take and it's benefitial to
            have it active while taking any type of damage.
          </p>
          <p>
            In the chart below, you can see your Consecration and Shield of the Righteous(wip)
            uptimes and compare them to your damage intake.
          </p>
        </Explanation>
      </SubSection>
      <SubSection title="Timeline">
        <Timeline analyzers={timelineAnalyzers} />
      </SubSection>
    </>
  );
};

export default ActiveMitigation;
